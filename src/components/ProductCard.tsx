import { Link } from 'react-router-dom'
import { TimeBar } from './TimeBar'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import { remainingShort, remainingText } from '@/lib/format'
import type { ProductRow } from '@/types/app'

export function ProductCard({
  product,
  compact = false,
}: {
  product: ProductRow
  compact?: boolean
}) {
  const style = statusStyles[product.warranty_status]
  const meta = [product.brand, product.merchant].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/urun/${product.id}`}
      className={cn(
        'block rounded-card border border-line bg-surface transition-colors',
        'hover:border-line-strong active:bg-sunken',
        compact ? 'p-3.5' : 'p-4',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold leading-snug text-ink">
            {product.name}
          </p>
          {meta && (
            <p className="mt-0.5 truncate text-[13px] text-ink-faint">{meta}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <span className={cn('tabular text-[15px] font-semibold', style.text)}>
            {remainingShort(product.days_left)}
          </span>
        </div>
      </div>

      <TimeBar
        className="mt-3"
        purchaseDate={product.purchase_date}
        warrantyEnd={product.warranty_end}
        status={product.warranty_status}
        daysLeft={product.days_left}
      />

      {!compact && (
        <p className="mt-2 text-[13px] text-ink-soft">
          {remainingText(product.days_left)}
        </p>
      )}
    </Link>
  )
}
