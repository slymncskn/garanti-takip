import { todayInput, toDateInput } from './format'
import type { ProductDraft, ProductRow } from '@/types/app'

export function rowToDraft(row: ProductRow): ProductDraft {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? '',
    category: row.category ?? '',
    serial_number: row.serial_number ?? '',
    price: row.price === null ? '' : String(row.price),
    purchase_date: toDateInput(row.purchase_date),
    warranty_months: row.warranty_months,
    notes: row.notes ?? '',
  }
}

/** Varsayılan garanti 24 ay — Türkiye'de en yaygın süre. */
export function emptyDraft(purchaseDate?: string | null): ProductDraft {
  return {
    name: '',
    brand: '',
    category: '',
    serial_number: '',
    price: '',
    purchase_date: toDateInput(purchaseDate) || todayInput(),
    warranty_months: 24,
    notes: '',
  }
}

/** Kaydetmeden önceki tek zorunlu kontrol; sorun yoksa null. */
export function validateDraft(draft: ProductDraft): string | null {
  if (draft.name.trim() === '') return 'Ürün adı boş kalamaz.'
  if (!draft.purchase_date) return 'Alım tarihi gerekli.'
  return null
}
