import { TextAreaField, TextField } from '@/components/ui/Field'
import { WarrantyPicker } from './WarrantyPicker'
import { useI18n } from '@/i18n'
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
  const { t } = useI18n()

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    onChange({ ...draft, [key]: value })

  const warrantyEnd = computeEnd(draft.purchase_date, draft.warranty_months)

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label={t('fields.name')}
        required
        value={draft.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder={t('fields.namePlaceholder')}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t('fields.brand')}
          value={draft.brand}
          onChange={(e) => set('brand', e.target.value)}
        />
        <TextField
          label={t('fields.category')}
          value={draft.category}
          onChange={(e) => set('category', e.target.value)}
        />
      </div>

      {showMerchant && merchant && (
        <p className="text-[13px] text-ink-faint">
          {t('fields.merchant')}:{' '}
          <span className="text-ink-soft">{merchant}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t('fields.purchaseDate')}
          type="date"
          numeric
          required
          value={draft.purchase_date}
          onChange={(e) => set('purchase_date', e.target.value)}
        />
        <TextField
          label={t('fields.price')}
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
          {t('fields.warrantyEndPreview')}{' '}
          <span className="tabular font-medium text-ink">
            {formatDate(warrantyEnd)}
          </span>
        </p>
      )}

      <TextField
        label={t('fields.serial')}
        value={draft.serial_number}
        onChange={(e) => set('serial_number', e.target.value)}
      />

      <TextAreaField
        label={t('fields.notes')}
        value={draft.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder={t('fields.notesPlaceholder')}
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
