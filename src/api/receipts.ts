import { supabase, requireUserId } from '@/lib/supabase'
import { notifyReceiptUploaded } from '@/lib/n8n'
import { buildStoragePath, prepareForUpload } from '@/lib/image'
import { toReceiptRow } from '@/lib/rows'
import type { ReceiptRow, ReceiptStatus } from '@/types/app'

const BUCKET = 'receipts'

/** Henüz sonuçlanmamış fişler — koşullu polling bunları izler. */
export const OPEN_STATUSES: ReceiptStatus[] = [
  'pending',
  'processing',
  'parsed',
  'failed',
]

export interface UploadResult {
  receiptId: string
  filePath: string
}

/**
 * Fiş yükleme.
 *
 * Sıra bozulamaz: önce Storage'a yükle → sonra `receipts` satırını
 * `pending` ile oluştur → sonra webhook. Ters sırada n8n olmayan bir dosyayı
 * indirmeye çalışır.
 */
export async function uploadReceipt(file: File): Promise<UploadResult> {
  const userId = await requireUserId()
  const prepared = await prepareForUpload(file)
  const filePath = buildStoragePath(userId, prepared.extension)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, prepared.blob, {
      contentType: prepared.contentType,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('receipts')
    .insert({
      user_id: userId,
      file_path: filePath,
      file_type: prepared.contentType,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    // Satır yazılamadıysa dosyayı bırakma; kimse okumayacak.
    await supabase.storage.from(BUCKET).remove([filePath])
    throw error
  }

  notifyReceiptUploaded(data.id)

  return { receiptId: data.id, filePath }
}

export async function getReceipt(id: string): Promise<ReceiptRow | null> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? toReceiptRow(data) : null
}

/**
 * Ekranda durum takibi yapılacak fişler. Hepsi `confirmed` olduğunda liste
 * boşalır ve polling kendiliğinden durur.
 */
export async function listOpenReceipts(): Promise<ReceiptRow[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .in('status', OPEN_STATUSES)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toReceiptRow)
}

/** Fiş görselini göstermek için imzalı URL (1 saat). Public URL yok. */
export async function getSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600)

  if (error) throw error
  return data.signedUrl
}

/** Okunamayan fişi yeniden kuyruğa alır. */
export async function retryReceipt(id: string): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .update({ status: 'pending', error_message: null })
    .eq('id', id)

  if (error) throw error
  notifyReceiptUploaded(id)
}

/** Fişi ve dosyasını siler. Bağlı ürünler kullanıcı tarafından ayrıca silinir. */
export async function deleteReceipt(id: string): Promise<void> {
  const receipt = await getReceipt(id)
  const { error } = await supabase.from('receipts').delete().eq('id', id)
  if (error) throw error

  if (receipt?.file_path) {
    await supabase.storage.from(BUCKET).remove([receipt.file_path])
  }
}
