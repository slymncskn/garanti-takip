import type { Database } from './database'

export type { Json } from './database'

/** `receipts.status` CHECK kısıtı. */
export type ReceiptStatus =
  | 'pending'
  | 'processing'
  | 'parsed'
  | 'confirmed'
  | 'failed'

/** `v_products.warranty_status` CASE ifadesi. */
export type WarrantyStatus =
  | 'expired'
  | 'critical'
  | 'warning'
  | 'soon'
  | 'active'

/** `reminders.threshold` CHECK kısıtı. */
export type ReminderThreshold = '6m' | '3m' | '1m' | '1w' | 'expired'

type VProductsRow = Database['public']['Views']['v_products']['Row']
type ReceiptsRow = Database['public']['Tables']['receipts']['Row']

/**
 * Tüm liste ve detay ekranlarının ortak satır tipi.
 *
 * Postgres view kolonlarını her zaman nullable üretir; oysa kaynak tabloda
 * bu alanlar NOT NULL. Uygulama tarafında daraltıyoruz — daraltmanın
 * doğrulaması `lib/rows.ts` içindeki dönüştürücüde yapılıyor, ekranlar
 * sürekli null kontrolü yapmak zorunda kalmasın.
 */
export interface ProductRow
  extends Omit<
    VProductsRow,
    | 'id'
    | 'user_id'
    | 'name'
    | 'purchase_date'
    | 'warranty_end'
    | 'warranty_months'
    | 'is_confirmed'
    | 'created_at'
    | 'days_left'
    | 'warranty_status'
    | 'receipt_status'
  > {
  id: string
  user_id: string
  name: string
  purchase_date: string
  warranty_end: string
  warranty_months: number
  is_confirmed: boolean
  created_at: string
  days_left: number
  warranty_status: WarrantyStatus
  /** Elle eklenen üründe fiş yok → null. */
  receipt_status: ReceiptStatus | null
}

export interface ReceiptRow extends Omit<ReceiptsRow, 'status'> {
  status: ReceiptStatus
}

export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type ReceiptInsert = Database['public']['Tables']['receipts']['Insert']

/** Ham (daraltılmamış) view satırı — yalnızca dönüştürücü kullanır. */
export type RawProductRow = VProductsRow
export type RawReceiptRow = ReceiptsRow

/**
 * Onay/düzenleme formunun taşıdığı alanlar.
 * `warranty_end` burada yok — GENERATED kolon, asla gönderilmez.
 */
export interface ProductDraft {
  /** Mevcut kayıt düzenleniyorsa dolu, yeni satırda undefined. */
  id?: string
  name: string
  brand: string
  category: string
  serial_number: string
  price: string
  purchase_date: string
  warranty_months: number
  notes: string
}
