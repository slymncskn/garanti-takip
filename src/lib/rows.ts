import type {
  ProductRow,
  RawProductRow,
  RawReceiptRow,
  ReceiptRow,
  ReceiptStatus,
  WarrantyStatus,
} from '@/types/app'

const warrantyStatuses: WarrantyStatus[] = [
  'expired',
  'critical',
  'warning',
  'soon',
  'active',
]

const receiptStatuses: ReceiptStatus[] = [
  'pending',
  'processing',
  'parsed',
  'confirmed',
  'failed',
]

/**
 * View satırını uygulama tipine daraltır.
 *
 * `v_products` tüm kolonları nullable üretir çünkü Postgres view'larda
 * NOT NULL bilgisini taşımaz; kaynak tabloda bu alanlar zorunlu. Beklenmedik
 * bir null gelirse satırı düşürüyoruz — tek bir bozuk kayıt yüzünden ekranın
 * tamamı çökmesin.
 */
export function toProductRow(row: RawProductRow): ProductRow | null {
  if (
    row.id === null ||
    row.user_id === null ||
    row.name === null ||
    row.purchase_date === null ||
    row.warranty_end === null ||
    row.warranty_months === null ||
    row.is_confirmed === null ||
    row.created_at === null ||
    row.days_left === null ||
    !isWarrantyStatus(row.warranty_status)
  ) {
    return null
  }

  return {
    ...row,
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    purchase_date: row.purchase_date,
    warranty_end: row.warranty_end,
    warranty_months: row.warranty_months,
    is_confirmed: row.is_confirmed,
    created_at: row.created_at,
    days_left: row.days_left,
    warranty_status: row.warranty_status,
    receipt_status: isReceiptStatus(row.receipt_status)
      ? row.receipt_status
      : null,
  }
}

export function toProductRows(rows: RawProductRow[] | null): ProductRow[] {
  return (rows ?? [])
    .map(toProductRow)
    .filter((row): row is ProductRow => row !== null)
}

/** `status` veritabanında `text` + CHECK; tipte daraltıyoruz. */
export function toReceiptRow(row: RawReceiptRow): ReceiptRow {
  return {
    ...row,
    status: isReceiptStatus(row.status) ? row.status : 'pending',
  }
}

function isWarrantyStatus(value: string | null): value is WarrantyStatus {
  return value !== null && warrantyStatuses.includes(value as WarrantyStatus)
}

function isReceiptStatus(value: string | null): value is ReceiptStatus {
  return value !== null && receiptStatuses.includes(value as ReceiptStatus)
}
