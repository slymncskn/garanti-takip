import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import { elapsedRatio, formatDate, remainingText } from '@/lib/format'
import type { WarrantyStatus } from '@/types/app'

interface TimeBarProps {
  purchaseDate: string
  warrantyEnd: string
  status: WarrantyStatus
  daysLeft: number
  /** Uçlara tarihleri yazar — detay ekranında işe yarıyor. */
  withDates?: boolean
  className?: string
}

/**
 * İmza öğesi: satın alma tarihinden garanti bitişine uzanan aralıkta geçen
 * kısmı dolduran ince şerit. Sayı okumadan durumu anlatan tek öğe budur;
 * gözü çeken de bu olmalı, kartın gerisi sakin kalır.
 */
export function TimeBar({
  purchaseDate,
  warrantyEnd,
  status,
  daysLeft,
  withDates = false,
  className,
}: TimeBarProps) {
  const ratio = elapsedRatio(purchaseDate, warrantyEnd)
  const style = statusStyles[status]
  const percent = Math.round(ratio * 100)

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${remainingText(daysLeft)}. Garanti ${formatDate(
          purchaseDate,
        )} – ${formatDate(warrantyEnd)}.`}
        className={cn('h-1.5 w-full overflow-hidden rounded-full', style.rail)}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            style.bar,
          )}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>

      {withDates && (
        <div className="mt-1.5 flex justify-between">
          <span className="tabular text-[12px] text-ink-faint">
            {formatDate(purchaseDate)}
          </span>
          <span className={cn('tabular text-[12px]', style.text)}>
            {formatDate(warrantyEnd)}
          </span>
        </div>
      )}
    </div>
  )
}
