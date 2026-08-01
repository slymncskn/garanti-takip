import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

/**
 * "Yeni fiş yüklendi" bildirimini n8n'e ileten röle.
 *
 * Neden var: kullanıcının ağında `hstgr.cloud` alan adı SNI seviyesinde
 * engelleniyor — TLS el sıkışması sıfırlanıyor, yani tarayıcı n8n'e hiçbir
 * koşulda ulaşamıyor. Bu fonksiyon Supabase altyapısında çalıştığı için o
 * engelden etkilenmiyor ve isteği sunucu tarafından iletiyor.
 *
 * Yan fayda: webhook sırrı artık istemci paketinde değil, Supabase secret'ında.
 *
 * Sözleşme korunur: çağrı fire-and-forget'tir. n8n ulaşılamaz olsa bile
 * 202 döner — n8n'in yedek tetikleyicisi bekleyen fişleri zaten topluyor,
 * kullanıcıya gösterilecek bir hata yok.
 */

const N8N_WEBHOOK_URL =
  Deno.env.get('N8N_WEBHOOK_URL') ??
  'https://n8n.srv1508998.hstgr.cloud/webhook/receipt-uploaded'
const N8N_WEBHOOK_SECRET = Deno.env.get('N8N_WEBHOOK_SECRET') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Yalnızca POST' }, 405)
  }

  // JWT doğrulaması platform tarafında yapılıyor (verify_jwt).
  // Buraya gelen istek oturum açmış bir kullanıcıya ait demektir.
  let receiptId = ''
  try {
    const body = await req.json()
    receiptId = typeof body?.receipt_id === 'string' ? body.receipt_id : ''
  } catch {
    // Gövde okunamadıysa da devam: n8n bekleyen tüm fişleri işliyor.
  }

  if (!N8N_WEBHOOK_SECRET) {
    console.error('N8N_WEBHOOK_SECRET tanımlı değil, bildirim atlandı')
    return json({ ok: false, reason: 'secret-missing' }, 202)
  }

  try {
    const form = new URLSearchParams({
      secret: N8N_WEBHOOK_SECRET,
      receipt_id: receiptId,
    })

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      // n8n yanıt vermezse kullanıcıyı bekletmeyelim.
      signal: AbortSignal.timeout(8000),
    })

    console.log(`n8n bildirimi: ${res.status} (receipt ${receiptId || 'yok'})`)
    return json({ ok: res.ok, status: res.status }, 202)
  } catch (error) {
    // Ulaşılamadı — yutuyoruz. Saatlik yedek tetikleyici toplayacak.
    console.error('n8n bildirimi başarısız:', String(error))
    return json({ ok: false, reason: 'unreachable' }, 202)
  }
})
