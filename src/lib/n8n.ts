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
 */
export function notifyReceiptUploaded(receiptId: string): void {
  if (!webhookUrl || !webhookSecret) return

  void fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-garanti-secret': webhookSecret,
    },
    body: JSON.stringify({ receipt_id: receiptId }),
    keepalive: true,
  }).catch(() => {
    /* sessizce yut — yedek tetikleyici zaten toplayacak */
  })
}
