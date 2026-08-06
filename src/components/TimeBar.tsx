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
  /** Liste satırında kullanılan ince hâli. */
  thin?: boolean
  className?: string
}

/**
 * İmza öğesi: satın alma tarihinden garanti bitişine uzanan aralıkta geçen
 * kısmı dolduran ince şerit. Sayı okumadan durumu anlatan tek öğe budur.
 *
 * Dolgu, geçilen sürenin renk yolculuğunu gösteren bir gradyandır:
 * yeşilden mevcut durumun rengine.
 */
export function TimeBar({
  purchaseDate,
  warrantyEnd,
  status,
  daysLeft,
  withDates = false,
  thin = false,
  className,
}: TimeBarProps) {
  const ratio = elapsedRatio(purchaseDate, warrantyEnd)
  const style = statusStyles[status]
  const percent = Math.round(ratio * 100)

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${remainingText(daysLeft)}. ${formatDate(
          purchaseDate,
        )} – ${formatDate(warrantyEnd)}.`}
        className={cn(
          'w-full overflow-hidden rounded-full bg-ink/[0.07]',
          thin ? 'h-1' : 'h-2.5',
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${Math.max(percent, 2)}%`,
            backgroundImage: `linear-gradient(90deg, ${statusStyles.active.hex}, ${style.hex})`,
          }}
        />
      </div>

      {withDates && (
        <div className="mt-2 flex justify-between">
          <span className="tabular text-[11.5px] font-medium text-ink-faint">
            {formatDate(purchaseDate)}
          </span>
          <span className={cn('tabular text-[11.5px] font-medium', style.text)}>
            {formatDate(warrantyEnd)}
          </span>
        </div>
      )}
    </div>
  )
}
