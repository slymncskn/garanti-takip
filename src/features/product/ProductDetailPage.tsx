import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDeleteProduct, useProduct } from '@/hooks/useProducts'
import { useI18n } from '@/i18n'
import { TimeBar } from '@/components/TimeBar'
import { ReceiptViewer } from '@/components/ReceiptViewer'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton, Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import {
  formatLongDate,
  formatMoney,
  remainingText,
  warrantyMonthsLabel,
} from '@/lib/format'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(id)
  const remove = useDeleteProduct()
  const { t } = useI18n()
  const [confirming, setConfirming] = useState(false)

  if (isLoading) return <Skeleton className="h-96" />

  if (isError || !product) {
    return (
      <ErrorNote
        title={t('common.error')}
        description={t('product.notFound')}
      />
    )
  }

  const style = statusStyles[product.warranty_status]

  return (
    <div className="flex flex-col gap-5">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <StatusBadge status={product.warranty_status} />
          {!product.is_confirmed && (
            <span className="rounded-full bg-soon-soft px-2 py-0.5 text-[12px] font-medium text-soon">
              {t('product.awaiting')}
            </span>
          )}
        </div>

        <h1 className="font-display text-[24px] font-bold leading-tight tracking-tight text-ink">
          {product.name}
        </h1>

        {(product.brand || product.merchant) && (
          <p className="mt-1 text-[14px] text-ink-faint">
            {[product.brand, product.merchant].filter(Boolean).join(' · ')}
          </p>
        )}
      </header>

      <Card className="p-4">
        <p className={cn('font-display text-[19px] font-semibold', style.text)}>
          {remainingText(product.days_left)}
        </p>
        <TimeBar
          className="mt-3"
          purchaseDate={product.purchase_date}
          warrantyEnd={product.warranty_end}
          status={product.warranty_status}
          daysLeft={product.days_left}
          withDates
        />
      </Card>

      <Card className="divide-y divide-line">
        <Row
          label={t('product.purchaseDate')}
          value={formatLongDate(product.purchase_date)}
          mono
        />
        <Row
          label={t('product.warranty')}
          value={warrantyMonthsLabel(product.warranty_months)}
        />
        <Row
          label={t('product.warrantyEnd')}
          value={formatLongDate(product.warranty_end)}
          mono
        />
        <Row label={t('product.price')} value={formatMoney(product.price)} mono />
        {product.category && (
          <Row label={t('product.category')} value={product.category} />
        )}
        {product.serial_number && (
          <Row label={t('product.serial')} value={product.serial_number} mono />
        )}
      </Card>

      {product.notes && (
        <Card className="p-4">
          <p className="mb-1 text-[13px] font-medium text-ink-faint">
            {t('product.notes')}
          </p>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            {product.notes}
          </p>
        </Card>
      )}

      {product.file_path && (
        <section>
          <p className="mb-2 text-[13px] font-medium text-ink-faint">
            {t('receipt.label')}
          </p>
          <ReceiptViewer filePath={product.file_path} />
        </section>
      )}

      <div className="flex gap-2">
        <Link to={`/urun/${product.id}/duzenle`} className="flex-1">
          <Button variant="secondary" full>
            {t('product.edit')}
          </Button>
        </Link>
        <Button
          variant="danger"
          onClick={() => setConfirming(true)}
          disabled={remove.isPending}
        >
          {t('product.delete')}
        </Button>
      </div>

      {confirming && (
        <Card className="border-critical/25 bg-critical-soft/50 p-4">
          <p className="font-medium text-ink">{t('product.deleteAsk')}</p>
          <p className="mt-1 text-[14px] text-ink-soft">
            {t('product.deleteBody')}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="danger"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(product.id, {
                  onSuccess: () => navigate('/', { replace: true }),
                })
              }
            >
              {remove.isPending && <Spinner />}
              {t('product.deleteYes')}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('product.cancel')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <span className="text-[14px] text-ink-faint">{label}</span>
      <span
        className={cn(
          'text-right text-[15px] text-ink',
          mono && 'tabular text-[14px]',
        )}
      >
        {value}
      </span>
    </div>
  )
}
