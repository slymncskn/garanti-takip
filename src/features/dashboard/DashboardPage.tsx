import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { splitProducts, useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/ProductCard'
import { PendingReceipts } from './PendingReceipts'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import type { ProductRow } from '@/types/app'

type Filter = 'all' | 'active' | 'soon' | 'expired'

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Hepsi' },
  { id: 'active', label: 'Sürüyor' },
  { id: 'soon', label: 'Yaklaşan' },
  { id: 'expired', label: 'Dolmuş' },
]

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useProducts()
  const [filter, setFilter] = useState<Filter>('all')

  const { awaitingConfirmation, expiringSoon, all } = useMemo(
    () => splitProducts(data ?? []),
    [data],
  )

  const filtered = useMemo(() => applyFilter(all, filter), [all, filter])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorNote
        description="Ürünler getirilemedi. Bağlantını kontrol edip tekrar dene."
        action={
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Tekrar dene
          </Button>
        }
      />
    )
  }

  const hasAnything = (data ?? []).length > 0

  return (
    <div>
      <PendingReceipts />

      {awaitingConfirmation.length > 0 && (
        <section className="mb-8">
          <SectionTitle tone="attention" count={awaitingConfirmation.length}>
            Onay bekliyor
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {groupByReceipt(awaitingConfirmation).map(
              ([receiptId, products]) => (
                <Card
                  key={receiptId}
                  className="border-soon/40 bg-soon-soft/40 p-4"
                >
                  <p className="font-display text-[15px] font-semibold text-ink">
                    {products[0]?.merchant ?? 'Yeni fiş'}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {products.length} ürün okundu. Bilgileri kontrol edip
                    onaylayana kadar hatırlatma gelmez.
                  </p>
                  <ul className="mt-3 flex flex-col gap-1">
                    {products.slice(0, 3).map((p) => (
                      <li key={p.id} className="truncate text-[14px] text-ink">
                        · {p.name}
                      </li>
                    ))}
                    {products.length > 3 && (
                      <li className="text-[13px] text-ink-faint">
                        ve {products.length - 3} tane daha
                      </li>
                    )}
                  </ul>
                  <Link to={`/onay/${receiptId}`} className="mt-4 block">
                    <Button full>Kontrol et ve onayla</Button>
                  </Link>
                </Card>
              ),
            )}
          </div>
        </section>
      )}

      {expiringSoon.length > 0 && (
        <section className="mb-8">
          <SectionTitle count={expiringSoon.length}>
            Süresi yaklaşanlar
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {expiringSoon.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle count={filtered.length}>Tüm ürünler</SectionTitle>

        {all.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  'min-h-11 rounded-full px-3.5 text-[13px] font-medium transition-colors',
                  filter === f.id
                    ? 'bg-ink text-paper'
                    : 'bg-sunken text-ink-soft hover:text-ink',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            title={hasAnything ? 'Bu filtrede ürün yok' : 'Henüz ürün yok'}
            description={
              hasAnything
                ? 'Başka bir filtre dene ya da yeni bir fiş yükle.'
                : 'Sağ alttaki artıya dokunup ilk fişini yükle. Ürünleri okuyup garanti sürelerini takip etmeye başlayalım.'
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function applyFilter(products: ProductRow[], filter: Filter): ProductRow[] {
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

function groupByReceipt(products: ProductRow[]): Array<[string, ProductRow[]]> {
  const groups = new Map<string, ProductRow[]>()
  for (const product of products) {
    const key = product.receipt_id ?? product.id
    const list = groups.get(key)
    if (list) list.push(product)
    else groups.set(key, [product])
  }
  return [...groups.entries()]
}
