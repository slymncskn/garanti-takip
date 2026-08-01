const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
const webhookSecret = import.meta.env.VITE_N8N_WEBHOOK_SECRET

/**
 * "Yeni fiş yüklendi, işleyebilirsin" bildirimi.
 *
 * Fire-and-forget: yanıt beklenmez, hata kullanıcıya gösterilmez. Bu istek
 * düşse bile veri kaybolmaz — n8n saatlik olarak `status='pending'` kayıtları
 * kendisi tarar. Bu yüzden burada asla `throw` yok.
 *
 * Çağrı sırası önemli: Storage'a yükle → `receipts` satırını oluştur → sonra bu.
 *
 * CORS notu — burası kolay bozulur:
 * İstek bilerek "basit istek" olarak kuruluyor: özel başlık yok, içerik tipi
 * `application/x-www-form-urlencoded`. Böylece tarayıcı OPTIONS ön kontrolü
 * yapmaz. Özel bir başlık (ör. `x-garanti-secret`) eklersen ön kontrol devreye
 * girer, tarayıcı o ön kontrolde özel başlıkları göndermez, n8n isteği
 * kimliksiz sayıp reddeder ve asıl POST hiç gönderilmez. Sır bu yüzden
 * gövdede taşınıyor; n8n tarafında webhook node'undaki "onlyRunIf" ifadesi
 * doğruluyor.
 *
 * `mode: 'no-cors'` yanıtı okunamaz yapar — zaten okumuyoruz — ve isteğin
 * yanıt başlıklarından bağımsız olarak gönderilmesini garantiler.
 */
export function notifyReceiptUploaded(receiptId: string): void {
  if (!webhookUrl || !webhookSecret) return

  const body = new URLSearchParams({
    secret: webhookSecret,
    receipt_id: receiptId,
  })

  void fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    keepalive: true,
  }).catch(() => {
    /* sessizce yut — yedek tetikleyici zaten toplayacak */
  })
}
