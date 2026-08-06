import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDeleteProduct, useProduct } from '@/hooks/useProducts'
import { useDownloadUrl } from '@/hooks/useReceiptStatus'
import { useWash } from '@/hooks/useWash'
import { useI18n } from '@/i18n'
import { NavBar, NavAction } from '@/components/ui/NavBar'
import { BackChevron, Chevron, ListGroup, ListRow } from '@/components/ui/List'
import { ActionSheet, SheetDestructive } from '@/components/ui/ActionSheet'
import { ReceiptViewer } from '@/components/ReceiptViewer'
import { TimeBar } from '@/components/TimeBar'
import { ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { initial } from '@/components/ProductRow'
import { downloadName } from '@/lib/download'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import { formatMoney, remainingParts, warrantyMonthsLabel } from '@/lib/format'
import type { ProductRow } from '@/types/app'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(id)
  const remove = useDeleteProduct()
  const { t } = useI18n()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  // Ürünün durumu ekranın arka plan yıkamasını sürükler.
  useWash(product ? statusStyles[product.warranty_status].wash : null)

  if (isLoading) {
    return (
      <>
        <DetailNav />
        <Skeleton className="mt-4 h-96" />
      </>
    )
  }

  if (isError || !product) {
    return (
      <>
        <DetailNav />
        <div className="pt-4">
          <ErrorNote
            title={t('common.error')}
            description={t('product.notFound')}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <DetailNav
        right={
          <NavAction onClick={() => navigate(`/urun/${product.id}/duzenle`)}>
            {t('product.edit')}
          </NavAction>
        }
      />

      <div className="flex flex-col gap-4 pt-2">
        <Identity product={product} />
        <Countdown product={product} />
        <Tiles product={product} />

        <ListGroup>
          {product.serial_number && (
            <ListRow
              label={t('product.serial')}
              value={product.serial_number}
              mono
            />
          )}

          {product.file_path && (
            <>
              <button
                type="button"
                onClick={() => setShowReceipt((v) => !v)}
                className="press-row flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-[14.5px] text-ink-faint">
                  {t('receipt.label')}
                </span>
                <span className="flex items-center gap-1.5 text-[15.5px] font-medium text-accent">
                  {showReceipt ? t('receipt.hide') : t('receipt.view')}
                  <Chevron
                    className={cn(
                      'text-accent transition-transform',
                      showReceipt && 'rotate-90',
                    )}
                  />
                </span>
              </button>
              <DownloadRow product={product} />
            </>
          )}

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="press-row flex min-h-12 w-full items-center px-4 py-3 text-left text-[15.5px] font-medium text-critical"
          >
            {t('product.deleteRow')}
          </button>
        </ListGroup>

        {showReceipt && product.file_path && (
          <ReceiptViewer filePath={product.file_path} />
        )}

        {product.notes && (
          <div className="glass-surface rounded-card p-4">
            <p className="mb-1 text-[12.5px] font-medium uppercase tracking-[0.03em] text-ink-faint">
              {t('product.notes')}
            </p>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {product.notes}
            </p>
          </div>
        )}
      </div>

      <ActionSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('product.deleteAsk')}
        description={t('product.deleteBody')}
        cancelLabel={t('product.cancel')}
      >
        <SheetDestructive
          label={t('product.deleteYes')}
          busy={remove.isPending}
          onClick={() => {
            navigator.vibrate?.(10)
            remove.mutate(product.id, {
              onSuccess: () => navigate('/', { replace: true }),
            })
          }}
        />
      </ActionSheet>
    </>
  )
}

function DetailNav({ right }: { right?: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <NavBar
      left={
        <Link
          to="/"
          className="press -mx-2 flex min-h-11 items-center gap-0.5 rounded-full px-2 text-[17px] text-accent"
        >
          <BackChevron />
          {t('nav.summary')}
        </Link>
      }
      right={right}
    />
  )
}

function Identity({ product }: { product: ProductRow }) {
  const style = statusStyles[product.warranty_status]
  const meta = [product.brand, product.merchant].filter(Boolean).join(' · ')

  return (
    <header className="flex flex-col items-center pt-2 text-center">
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-[18px] text-[22px] font-bold',
          style.chip,
        )}
        aria-hidden="true"
      >
        {initial(product.name)}
      </span>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
        {product.name}
      </h1>
      {meta && <p className="mt-1 text-[14px] text-ink-faint">{meta}</p>}
    </header>
  )
}

function Countdown({ product }: { product: ProductRow }) {
  const { t } = useI18n()
  const style = statusStyles[product.warranty_status]
  const parts = remainingParts(product.days_left)
  const expired = product.days_left < 0

  return (
    <section className="glass-surface rounded-[26px] p-[22px] text-center">
      <p
        className={cn(
          'text-[12px] font-semibold uppercase tracking-[0.06em]',
          style.text,
        )}
      >
        {expired ? t('detail.expiredLabel') : t('detail.countdownLabel')}
      </p>

      <p className="mt-2 flex items-baseline justify-center gap-2">
        <span className="tabular text-[68px] font-semibold leading-none tracking-[-0.05em] text-ink">
          {parts.value}
        </span>
        <span className="text-[20px] font-medium text-ink-faint">
          {t(parts.unit)}
        </span>
      </p>

      <TimeBar
        className="mt-5"
        purchaseDate={product.purchase_date}
        warrantyEnd={product.warranty_end}
        status={product.warranty_status}
        daysLeft={product.days_left}
        withDates
      />
    </section>
  )
}

function Tiles({ product }: { product: ProductRow }) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Tile label={t('product.warranty')}>
        {warrantyMonthsLabel(product.warranty_months)}
      </Tile>
      <Tile label={t('product.price')} mono>
        {formatMoney(product.price)}
      </Tile>
    </div>
  )
}

function Tile({
  label,
  children,
  mono = false,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="glass-surface rounded-[20px] px-3.5 py-3.5">
      <p className="text-[11.5px] font-medium uppercase tracking-[0.03em] text-ink-faint">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 truncate text-[20px] font-semibold text-ink',
          mono && 'tabular',
        )}
      >
        {children}
      </p>
    </div>
  )
}

/** İmzalı indirme bağlantısı sayfa açılırken hazırlanır (iOS gereği). */
function DownloadRow({ product }: { product: ProductRow }) {
  const { t } = useI18n()
  const fileName = downloadName(product)
  const { data: url } = useDownloadUrl(product.file_path, fileName)

  if (!url) {
    return (
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 opacity-50">
        <span className="text-[14.5px] text-ink-faint">
          {t('product.downloadRow')}
        </span>
      </div>
    )
  }

  return (
    <a
      href={url}
      download={fileName}
      className="press-row flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3"
    >
      <span className="text-[14.5px] text-ink-faint">
        {t('product.downloadRow')}
      </span>
      <span className="flex items-center gap-1.5 text-[15.5px] font-medium text-accent">
        {t('product.download')}
        <Chevron className="text-accent" />
      </span>
    </a>
  )
}
