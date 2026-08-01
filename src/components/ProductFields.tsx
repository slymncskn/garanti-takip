import { TextAreaField, TextField } from '@/components/ui/Field'
import { WarrantyPicker } from './WarrantyPicker'
import { formatDate } from '@/lib/format'
import type { ProductDraft } from '@/types/app'

/** Hem onay ekranı hem ürün formu bu alan setini kullanır. */
export function ProductFields({
  draft,
  onChange,
  showMerchant = false,
  merchant,
}: {
  draft: ProductDraft
  onChange: (next: ProductDraft) => void
  showMerchant?: boolean
  merchant?: string | null
}) {
  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    onChange({ ...draft, [key]: value })

  const warrantyEnd = computeEnd(draft.purchase_date, draft.warranty_months)

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Ürün adı"
        required
        value={draft.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Örn. Çamaşır makinesi"
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Marka"
          value={draft.brand}
          onChange={(e) => set('brand', e.target.value)}
        />
        <TextField
          label="Kategori"
          value={draft.category}
          onChange={(e) => set('category', e.target.value)}
        />
      </div>

      {showMerchant && merchant && (
        <p className="text-[13px] text-ink-faint">
          Satıcı: <span className="text-ink-soft">{merchant}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Alım tarihi"
          type="date"
          numeric
          required
          value={draft.purchase_date}
          onChange={(e) => set('purchase_date', e.target.value)}
        />
        <TextField
          label="Fiyat"
          inputMode="decimal"
          numeric
          placeholder="0,00"
          value={draft.price}
          onChange={(e) => set('price', e.target.value)}
        />
      </div>

      <WarrantyPicker
        value={draft.warranty_months}
        onChange={(months) => set('warranty_months', months)}
      />

      {warrantyEnd && (
        <p className="rounded-xl bg-sunken px-3 py-2.5 text-[13px] text-ink-soft">
          Garanti bitişi:{' '}
          <span className="tabular font-medium text-ink">
            {formatDate(warrantyEnd)}
          </span>
        </p>
      )}

      <TextField
        label="Seri numarası"
        value={draft.serial_number}
        onChange={(e) => set('serial_number', e.target.value)}
      />

      <TextAreaField
        label="Not"
        value={draft.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder="Servis telefonu, nerede durduğu, aklında kalsın istediğin her şey"
      />
    </div>
  )
}

/**
 * Yalnızca önizleme için. Gerçek `warranty_end` veritabanında hesaplanır;
 * bu değer hiçbir zaman yazılmaz.
 */
function computeEnd(purchaseDate: string, months: number): string | null {
  if (!purchaseDate) return null
  const date = new Date(`${purchaseDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  date.setMonth(date.getMonth() + months)
  return date.toISOString().slice(0, 10)
}
