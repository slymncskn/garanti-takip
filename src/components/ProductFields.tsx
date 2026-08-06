import { ListField, ListTextArea } from '@/components/ui/ListField'
import { ListGroup, ListRow } from '@/components/ui/List'
import { WarrantyPicker } from './WarrantyPicker'
import { useI18n } from '@/i18n'
import { formatDate } from '@/lib/format'
import type { DictKey } from '@/i18n'
import type { ProductDraft } from '@/types/app'

/**
 * Hem onay ekranı hem ürün formu bu alan setini kullanır.
 * Alanlar iOS'un gruplanmış liste satırlarına oturur: etiket solda,
 * değer sağda.
 */
export function ProductFields({
  draft,
  onChange,
  merchant,
  errorKey,
}: {
  draft: ProductDraft
  onChange: (next: ProductDraft) => void
  merchant?: string | null
  /** Doğrulama hatası — ilgili satırın altında gösterilir. */
  errorKey?: DictKey | null
}) {
  const { t } = useI18n()

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    onChange({ ...draft, [key]: value })

  const warrantyEnd = computeEnd(draft.purchase_date, draft.warranty_months)

  return (
    <div className="flex flex-col gap-4">
      <ListGroup>
        <ListField
          label={t('fields.name')}
          required
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('fields.namePlaceholder')}
          error={errorKey === 'form.nameRequired' ? t(errorKey) : undefined}
        />
        <ListField
          label={t('fields.brand')}
          value={draft.brand}
          onChange={(e) => set('brand', e.target.value)}
          placeholder={t('fields.optional')}
        />
        <ListField
          label={t('fields.category')}
          value={draft.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder={t('fields.optional')}
        />
        {merchant && (
          <ListRow label={t('fields.merchant')} value={merchant} />
        )}
      </ListGroup>

      <ListGroup>
        <ListField
          label={t('fields.purchaseDate')}
          type="date"
          mono
          required
          value={draft.purchase_date}
          onChange={(e) => set('purchase_date', e.target.value)}
          error={errorKey === 'form.dateRequired' ? t(errorKey) : undefined}
        />
        <ListField
          label={t('fields.price')}
          inputMode="decimal"
          mono
          placeholder="0,00"
          value={draft.price}
          onChange={(e) => set('price', e.target.value)}
        />
        <WarrantyPicker
          value={draft.warranty_months}
          onChange={(months) => set('warranty_months', months)}
        />
        {warrantyEnd && (
          <div className="mx-4 mb-3 flex items-center justify-between rounded-field bg-active-soft px-3 py-2.5">
            <span className="text-[13px] font-medium text-active">
              {t('fields.warrantyEndPreview')}
            </span>
            <span className="tabular text-[14px] font-semibold text-active">
              {formatDate(warrantyEnd)}
            </span>
          </div>
        )}
      </ListGroup>

      <ListGroup>
        <ListField
          label={t('fields.serial')}
          mono
          value={draft.serial_number}
          onChange={(e) => set('serial_number', e.target.value)}
          placeholder={t('fields.optional')}
        />
        <ListTextArea
          label={t('fields.notes')}
          value={draft.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder={t('fields.notesPlaceholder')}
        />
      </ListGroup>
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
