import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type DictKey } from '@/i18n'
import { splitProducts, useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { ProductRow, initial } from '@/components/ProductRow'
import { EmptyRing, StatusRing } from '@/components/StatusRing'
import { ProcessingSection } from './ProcessingSection'
import { useAddReceipt } from '@/components/AppShell'
import { ListGroup, SectionLabel } from '@/components/ui/List'
import { Skeleton } from '@/components/ui/Spinner'
import { ErrorNote } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import type { ProductRow as Product, WarrantyStatus } from '@/types/app'

type Filter = 'all' | 'active' | 'soon' | 'expired'

const filters: Array<{ id: Filter; label: DictKey }> = [
  { id: 'all', label: 'dash.filter.all' },
  { id: 'active', label: 'dash.filter.active' },
  { id: 'soon', label: 'dash.filter.soon' },
  { id: 'expired', label: 'dash.filter.expired' },
]

/** Kırılım listesinde gösterilen dört satır. */
const BREAKDOWN: Array<{ status: WarrantyStatus; label: DictKey }> = [
  { status: 'active', label: 'dash.count.active' },
  { status: 'soon', label: 'dash.count.soon' },
  { status: 'critical', label: 'dash.count.critical' },
  { status: 'expired', label: 'dash.count.expired' },
]

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useProducts()
  const { t } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')

  const { awaitingConfirmation, expiringSoon, all } = useMemo(
    () => splitProducts(data ?? []),
    [data],
  )

  const counts = useMemo(() => tally(all), [all])
  const filtered = useMemo(() => applyFilter(all, filter), [all, filter])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 pt-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="pt-6">
        <ErrorNote
          title={t('common.error')}
          description={t('dash.loadError')}
          action={
            <button
              type="button"
              onClick={() => void refetch()}
              className="press glass-chip min-h-11 rounded-field px-4 text-[14px] font-medium text-ink"
            >
              {t('dash.retry')}
            </button>
          }
        />
      </div>
    )
  }

  const hasAnything = (data ?? []).length > 0

  return (
    <div className="pt-4">
      <Header />

      {all.length > 0 && (
        <section className="glass-surface mb-[22px] flex items-center gap-5 rounded-card p-5">
          <StatusRing counts={counts} total={all.length} />
          <ul className="flex min-w-0 flex-col gap-2">
            {BREAKDOWN.map(({ status, label }) => (
              <li key={status} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusStyles[status].hex }}
                />
                <span className="tabular text-[14px] font-semibold text-ink">
                  {counts[status]}
                </span>
                <span className="truncate text-[13px] text-ink-soft">
                  {t(label)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {expiringSoon.length > 0 && (
        <section className="mb-[22px]">
          <SectionLabel>{t('dash.attention')}</SectionLabel>
          <ListGroup>
            {expiringSoon.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </ListGroup>
        </section>
      )}

      {awaitingConfirmation.length > 0 && (
        <section className="mb-[22px]">
          <SectionLabel>{t('dash.awaiting')}</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {groupByReceipt(awaitingConfirmation).map(
              ([receiptId, products]) => (
                <AwaitingCard
                  key={receiptId}
                  receiptId={receiptId}
                  products={products}
                />
              ),
            )}
          </div>
        </section>
      )}

      <ProcessingSection />

      <section>
        <SectionLabel>{t('dash.all')}</SectionLabel>

        {all.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  'press min-h-11 rounded-full px-3.5 text-[13.5px] font-medium transition-colors',
                  filter === f.id
                    ? 'bg-ink text-paper'
                    : 'glass-chip text-ink-soft',
                )}
              >
                {t(f.label)}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          hasAnything ? (
            <p className="px-1 py-6 text-center text-[14px] text-ink-faint">
              {t('dash.emptyFilterBody')}
            </p>
          ) : (
            <EmptyDashboard />
          )
        ) : (
          <ListGroup>
            {filtered.map((product) => (
              <ProductRow key={product.id} product={product} variant="bar" />
            ))}
          </ListGroup>
        )}
      </section>
    </div>
  )
}

function Header() {
  const { t } = useI18n()
  const { user } = useAuth()

  const label = (user?.email ?? '?').trim().slice(0, 2).toLocaleUpperCase('tr')

  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold uppercase leading-none tracking-[0.02em] text-ink-faint">
          {t('dash.eyebrow')}
        </p>
        <h1 className="mt-1.5 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
          {t('dash.today')}
        </h1>
      </div>

      <Link
        to="/hesap"
        aria-label={t('nav.account')}
        className="press glass-chip flex size-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-accent"
      >
        {label}
      </Link>
    </header>
  )
}

function AwaitingCard({
  receiptId,
  products,
}: {
  receiptId: string
  products: Product[]
}) {
  const { t } = useI18n()
  const merchant = products[0]?.merchant ?? t('dash.newReceipt')

  return (
    <div
      className="rounded-card p-4 backdrop-blur-[17px]"
      style={{
        background: 'rgba(253,238,224,0.62)',
        border: '0.5px solid rgba(178,80,0,0.28)',
        boxShadow: '0 12px 28px rgba(178,80,0,0.10)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[11px] bg-soon-soft text-[14px] font-bold text-soon">
          {initial(merchant)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15.5px] font-medium leading-tight text-ink">
            {merchant}
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            {t('dash.awaitingBody', { count: products.length })}
          </p>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {products.slice(0, 3).map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="size-1 shrink-0 rounded-full bg-soon" />
            <span className="truncate text-[14px] text-ink">{p.name}</span>
          </li>
        ))}
        {products.length > 3 && (
          <li className="pl-3 text-[13px] text-ink-faint">
            {t('dash.andMore', { count: products.length - 3 })}
          </li>
        )}
      </ul>

      <Link
        to={`/onay/${receiptId}`}
        className="press fill-action mt-4 flex h-12 w-full items-center justify-center rounded-[15px] text-[15.5px] font-semibold text-white"
      >
        {t('dash.review')}
      </Link>
    </div>
  )
}

function EmptyDashboard() {
  const { t } = useI18n()
  const addReceipt = useAddReceipt()

  return (
    <div className="px-2 py-8 text-center">
      <EmptyRing />
      <h2 className="mt-6 text-[24px] font-bold tracking-[-0.02em] text-ink">
        {t('dash.emptyTitle')}
      </h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-relaxed text-ink-soft">
        {t('dash.emptyBody')}
      </p>

      <button
        type="button"
        onClick={addReceipt}
        className="press fill-action mx-auto mt-6 flex h-13 items-center gap-2 rounded-control px-6 text-[16px] font-semibold text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        {t('upload.add')}
      </button>

      <Link
        to="/yeni"
        className="press mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-accent"
      >
        {t('dash.emptyManual')}
      </Link>
    </div>
  )
}

function tally(products: Product[]): Record<WarrantyStatus, number> {
  const counts: Record<WarrantyStatus, number> = {
    active: 0,
    soon: 0,
    warning: 0,
    critical: 0,
    expired: 0,
  }
  for (const product of products) counts[product.warranty_status] += 1
  return counts
}

function applyFilter(products: Product[], filter: Filter): Product[] {
  switch (filter) {
    case 'active':
      return products.filter((p) => p.days_left > 90)
    case 'soon':
      return products.filter((p) => p.days_left >= 0 && p.days_left <= 90)
    case 'expired':
      return products.filter((p) => p.days_left < 0)
    case 'all':
      return products
  }
}

function groupByReceipt(products: Product[]): Array<[string, Product[]]> {
  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const key = product.receipt_id ?? product.id
    const list = groups.get(key)
    if (list) list.push(product)
    else groups.set(key, [product])
  }
  return [...groups.entries()]
}
