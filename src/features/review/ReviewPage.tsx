import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useConfirmReceipt, useProductsByReceipt } from '@/hooks/useProducts'
import { useReceipt, useSignedUrl } from '@/hooks/useReceiptStatus'
import { useI18n, type DictKey } from '@/i18n'
import { NavBar, NavAction } from '@/components/ui/NavBar'
import { ProductFields } from '@/components/ProductFields'
import { ReceiptViewer } from '@/components/ReceiptViewer'
import { EmptyState, ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton, Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { emptyDraft, rowToDraft, validateDraft } from '@/lib/draft'
import { formatDate, formatMoney } from '@/lib/format'
import type { ProductDraft } from '@/types/app'

/**
 * Onay ekranı — sistemin doğruluk güvencesi.
 *
 * Atlanabilir değil: onaylanmayan ürün için hatırlatma maili gitmez. Ama
 * model çoğu zaman doğru okuyacağı için onay tek dokunuşla mümkün olmalı;
 * düzenleme isteğe bağlı kalır.
 */
export function ReviewPage() {
  const { receiptId } = useParams<{ receiptId: string }>()
  const navigate = useNavigate()

  const receipt = useReceipt(receiptId)
  const products = useProductsByReceipt(receiptId)
  const confirm = useConfirmReceipt(receiptId ?? '')
  const { t } = useI18n()

  const [drafts, setDrafts] = useState<ProductDraft[] | null>(null)
  const [errorKey, setErrorKey] = useState<DictKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (products.data && drafts === null) {
      setDrafts(products.data.map(rowToDraft))
    }
  }, [products.data, drafts])

  if (receipt.isLoading || products.isLoading) {
    return (
      <>
        <NavBar title={t('review.title')} />
        <Skeleton className="mt-4 h-96" />
      </>
    )
  }

  if (receipt.isError || !receipt.data) {
    return (
      <>
        <NavBar title={t('review.title')} />
        <div className="pt-4">
          <ErrorNote
            title={t('common.error')}
            description={t('review.notFound')}
          />
        </div>
      </>
    )
  }

  const status = receipt.data.status

  if (status === 'pending' || status === 'processing') {
    return (
      <>
        <ReviewNav onCancel={() => navigate('/')} />
        <div className="pt-6">
          <EmptyState
            title={t('review.stillReading')}
            description={t('review.stillReadingBody')}
            action={
              <Link to="/">
                <Button variant="secondary">{t('review.backHome')}</Button>
              </Link>
            }
          />
        </div>
      </>
    )
  }

  if (status === 'failed') {
    return (
      <>
        <ReviewNav onCancel={() => navigate('/')} />
        <div className="flex flex-col gap-4 pt-6">
          <EmptyState
            title={t('receipt.failed')}
            description={t('review.failedBody')}
            action={
              <Link to="/yeni">
                <Button>{t('receipt.manual')}</Button>
              </Link>
            }
          />
          <ReceiptViewer
            filePath={receipt.data.file_path}
            fileType={receipt.data.file_type}
          />
        </div>
      </>
    )
  }

  const list = drafts ?? []

  function update(index: number, next: ProductDraft) {
    setDrafts((prev) =>
      (prev ?? []).map((item, i) => (i === index ? next : item)),
    )
  }

  function remove(index: number) {
    setDrafts((prev) => (prev ?? []).filter((_, i) => i !== index))
  }

  function add() {
    setDrafts((prev) => [
      ...(prev ?? []),
      emptyDraft(receipt.data?.purchase_date),
    ])
  }

  async function onConfirm() {
    if (list.length === 0) {
      setError(t('review.needOne'))
      return
    }
    for (const draft of list) {
      const problem = validateDraft(draft)
      if (problem) {
        setErrorKey(problem)
        setError(t(problem))
        return
      }
    }

    setError(null)
    setErrorKey(null)
    try {
      await confirm.mutateAsync(list)
      navigator.vibrate?.(10)
      navigate('/', { replace: true })
    } catch {
      setError(t('review.saveFailed'))
    }
  }

  return (
    <>
      <ReviewNav onCancel={() => navigate('/')} count={list.length} />

      <div className="flex flex-col gap-4 pb-32 pt-4">
        <ReceiptSummary
          filePath={receipt.data.file_path}
          merchant={receipt.data.merchant}
          purchaseDate={receipt.data.purchase_date}
          total={receipt.data.total_amount}
          currency={receipt.data.currency}
          count={list.length}
          onZoom={() => setZoomed((v) => !v)}
          zoomed={zoomed}
        />

        {zoomed && (
          <ReceiptViewer
            filePath={receipt.data.file_path}
            fileType={receipt.data.file_type}
          />
        )}

        {list.length === 0 && (
          <EmptyState
            title={t('review.noProducts')}
            description={t('review.noProductsBody')}
          />
        )}

        {list.map((draft, index) => (
          <section key={draft.id ?? `new-${index}`}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.02em] text-ink-faint">
                {t('review.product', { n: index + 1 })}
              </h2>
              <button
                type="button"
                onClick={() => remove(index)}
                className="press min-h-11 text-[13.5px] font-medium text-ink-faint active:text-critical"
              >
                {t('review.remove')}
              </button>
            </div>

            <ProductFields
              draft={draft}
              onChange={(next) => update(index, next)}
              merchant={receipt.data?.merchant}
              errorKey={errorKey}
            />
          </section>
        ))}

        <button
          type="button"
          onClick={add}
          className="press glass-surface min-h-13 rounded-card text-[15.5px] font-medium text-accent"
        >
          {t('review.addProduct')}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-field bg-critical-soft px-3 py-2.5 text-[14px] text-critical"
          >
            {error}
          </p>
        )}
      </div>

      <div
        className="glass-chrome fixed inset-x-0 bottom-0 z-30 border-t-[0.5px] border-ink/[0.08]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-ink">
              {t('review.willSave', { count: list.length })}
            </p>
            <p className="text-[11.5px] text-ink-faint">
              {t('review.noReminderUntil')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={confirm.isPending}
            className="press fill-action flex h-[50px] shrink-0 items-center gap-2 rounded-[17px] px-6 text-[16px] font-semibold text-white disabled:opacity-60"
          >
            {confirm.isPending && <Spinner className="text-white" />}
            {t('review.confirm')}
          </button>
        </div>
      </div>
    </>
  )
}

function ReviewNav({
  onCancel,
  count,
}: {
  onCancel: () => void
  count?: number
}) {
  const { t } = useI18n()
  return (
    <NavBar
      left={<NavAction onClick={onCancel}>{t('form.cancel')}</NavAction>}
      title={t('review.title')}
      right={
        count !== undefined ? (
          <span className="tabular text-[11px] uppercase text-ink-faint">
            {t('review.count', { count })}
          </span>
        ) : undefined
      }
    />
  )
}

function ReceiptSummary({
  filePath,
  merchant,
  purchaseDate,
  total,
  currency,
  count,
  onZoom,
  zoomed,
}: {
  filePath: string
  merchant: string | null
  purchaseDate: string | null
  total: number | null
  currency: string | null
  count: number
  onZoom: () => void
  zoomed: boolean
}) {
  const { t } = useI18n()
  const { data: url } = useSignedUrl(filePath)

  const meta = [
    purchaseDate ? formatDate(purchaseDate) : null,
    total !== null ? formatMoney(total, currency ?? 'TRY') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="glass-surface flex gap-3.5 rounded-card p-3.5">
      <div className="h-[118px] w-[92px] shrink-0 overflow-hidden rounded-2xl bg-sunken shadow-[0_8px_18px_rgba(28,28,26,0.12)]">
        {url ? (
          <img
            src={url}
            alt={t('receipt.alt')}
            className="size-full object-cover"
          />
        ) : (
          <span className="block size-full animate-pulse bg-ink/5" />
        )}
      </div>

      <div className="flex min-w-0 flex-col items-start justify-center gap-1">
        <p className="truncate text-[17px] font-semibold text-ink">
          {merchant ?? t('dash.newReceipt')}
        </p>
        {meta && <p className="text-[13px] text-ink-soft">{meta}</p>}
        <span className="mt-0.5 rounded-full bg-soon-soft px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-soon">
          {t('review.readCount', { count })}
        </span>
        <button
          type="button"
          onClick={onZoom}
          className="press mt-1 min-h-11 text-[13.5px] font-medium text-accent"
        >
          {zoomed ? t('receipt.hide') : t('review.zoom')}
        </button>
      </div>
    </section>
  )
}
