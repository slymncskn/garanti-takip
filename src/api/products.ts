import { supabase, requireUserId } from '@/lib/supabase'
import { toProductRow, toProductRows } from '@/lib/rows'
import type { ProductDraft, ProductRow } from '@/types/app'

/**
 * Tüm Supabase çağrıları bu katmanda toplanır; bileşenler hook'ları,
 * hook'lar burayı çağırır. Okuma `v_products` view'ından, yazma `products`
 * tablosuna yapılır.
 */

export async function listProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('v_products')
    .select('*')
    .order('warranty_end', { ascending: true })

  if (error) throw error
  return toProductRows(data)
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabase
    .from('v_products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? toProductRow(data) : null
}

/** Bir fişten çıkan ürünler — onay ekranının kaynağı. */
export async function listProductsByReceipt(
  receiptId: string,
): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('v_products')
    .select('*')
    .eq('receipt_id', receiptId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return toProductRows(data)
}

/**
 * Türkçe karakter duyarsız arama (`unaccent` tabanlı).
 * Fonksiyon boş `q`'yu "hepsini döndür" olarak ele alıyor.
 */
export async function searchProducts(q: string): Promise<ProductRow[]> {
  const { data, error } = await supabase.rpc('search_products', {
    q: q.trim(),
  })

  if (error) throw error
  return toProductRows(data)
}

export async function createProduct(
  draft: ProductDraft,
  options: { receiptId?: string | null; isConfirmed?: boolean } = {},
): Promise<string> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      receipt_id: options.receiptId ?? null,
      is_confirmed: options.isConfirmed ?? true,
      ...draftToColumns(draft),
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateProduct(
  id: string,
  draft: ProductDraft,
  options: { isConfirmed?: boolean } = {},
): Promise<void> {
  const patch = {
    ...draftToColumns(draft),
    ...(options.isConfirmed === undefined
      ? {}
      : { is_confirmed: options.isConfirmed }),
  }

  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

/**
 * Onay ekranının kaydetme adımı.
 *
 * Kullanıcının bıraktığı liste tek doğru kabul edilir: silinenler kaldırılır,
 * düzenlenenler güncellenir, elle eklenenler yazılır. Hepsi
 * `is_confirmed = true` olur — onaylanmamış ürüne hatırlatma maili gitmez.
 * Ardından fiş `confirmed` durumuna geçer.
 */
export async function confirmReceipt(
  receiptId: string,
  drafts: ProductDraft[],
): Promise<void> {
  const userId = await requireUserId()

  const existing = await listProductsByReceipt(receiptId)
  const keptIds = new Set(drafts.map((d) => d.id).filter(Boolean) as string[])
  const removed = existing.filter((p) => !keptIds.has(p.id)).map((p) => p.id)

  if (removed.length > 0) {
    const { error } = await supabase.from('products').delete().in('id', removed)
    if (error) throw error
  }

  for (const draft of drafts) {
    if (draft.id) {
      await updateProduct(draft.id, draft, { isConfirmed: true })
    } else {
      await createProduct(draft, { receiptId, isConfirmed: true })
    }
  }

  const { error } = await supabase
    .from('receipts')
    .update({ status: 'confirmed' })
    .eq('id', receiptId)
    .eq('user_id', userId)

  if (error) throw error
}

/** `warranty_end` hesaplanan kolondur — gövdeye asla girmez. */
function draftToColumns(draft: ProductDraft) {
  return {
    name: draft.name.trim(),
    brand: emptyToNull(draft.brand),
    category: emptyToNull(draft.category),
    serial_number: emptyToNull(draft.serial_number),
    price: parsePrice(draft.price),
    purchase_date: draft.purchase_date,
    warranty_months: clampMonths(draft.warranty_months),
    notes: emptyToNull(draft.notes),
  }
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  // "1.299,90" ve "1299.90" ikisi de yazılabiliyor.
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function clampMonths(months: number): number {
  if (!Number.isFinite(months)) return 24
  return Math.min(240, Math.max(0, Math.round(months)))
}
