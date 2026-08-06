import { Link } from 'react-router-dom'
import { TimeBar } from './TimeBar'
import { Chevron } from '@/components/ui/List'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import { formatDate, remainingShort } from '@/lib/format'
import { useI18n } from '@/i18n'
import type { ProductRow as Product } from '@/types/app'

/**
 * Gruplanmış listenin ürün satırı. Özet, Ara ve Tüm ürünler aynı satırı
 * kullanır — tek yerde durması listelerin birbirinden ayrışmasını önlüyor.
 *
 * `days` varyantı kalan günü sayı olarak yazar (dikkat gerektirenler),
 * `bar` varyantı süre şeridini gösterir (uzun listeler).
 */
export function ProductRow({
  product,
  variant = 'days',
}: {
  product: Product
  variant?: 'days' | 'bar'
}) {
  const { t } = useI18n()
  const style = statusStyles[product.warranty_status]

  const meta = [
    formatDate(product.warranty_end),
    product.brand,
    product.merchant,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      to={`/urun/${product.id}`}
      className="press-row flex min-h-14 items-center gap-3 px-4 py-3"
    >
      <span
        className={cn(
          'flex size-[34px] shrink-0 items-center justify-center rounded-[11px] text-[14px] font-bold',
          style.chip,
        )}
        aria-hidden="true"
      >
        {initial(product.name)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15.5px] font-medium leading-tight tracking-[-0.015em] text-ink">
          {product.name}
        </span>
        {variant === 'days' ? (
          <span className="mt-0.5 block truncate text-[12.5px] leading-tight text-ink-faint">
            {meta}
          </span>
        ) : (
          <TimeBar
            thin
            className="mt-2 max-w-30"
            purchaseDate={product.purchase_date}
            warrantyEnd={product.warranty_end}
            status={product.warranty_status}
            daysLeft={product.days_left}
          />
        )}
      </span>

      {variant === 'days' ? (
        <span className="shrink-0 text-right">
          <span className={cn('tabular block text-[17px] font-semibold leading-none', style.text)}>
            {product.days_left < 0 ? '—' : product.days_left}
          </span>
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-ink-faint">
            {product.days_left < 0 ? t('status.expired') : t('time.dayUnit')}
          </span>
        </span>
      ) : (
        <span
          className={cn('tabular shrink-0 text-[14px] font-semibold', style.text)}
        >
          {remainingShort(product.days_left)}
        </span>
      )}

      <Chevron />
    </Link>
  )
}

/** Baş harf karesi — Türkçe büyük harf kuralına uyar (i → İ). */
export function initial(name: string): string {
  return (name.trim()[0] ?? '?').toLocaleUpperCase('tr')
}
