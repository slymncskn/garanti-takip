import { useEffect, useState } from 'react'
import { statusStyles } from '@/lib/status'
import { useI18n } from '@/i18n'
import type { WarrantyStatus } from '@/types/app'

/** 2πr, r = 52. Yayların uzunluğu bu çevre üzerinden hesaplanır. */
const CIRCUMFERENCE = 327

/** Yayların diziliş sırası — sağlıklıdan kritiğe. */
const ORDER: WarrantyStatus[] = [
  'active',
  'soon',
  'warning',
  'critical',
  'expired',
]

/**
 * Ürünlerin durum dağılımını tek bakışta veren segmentli halka.
 * İlk yüklemede yaylar sırayla çizilir; `prefers-reduced-motion` açıksa
 * geçişler global kuralla kapanır.
 */
export function StatusRing({
  counts,
  total,
}: {
  counts: Record<WarrantyStatus, number>
  total: number
}) {
  const { t } = useI18n()
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  let cursor = 0
  const arcs = ORDER.map((status, index) => {
    const count = counts[status]
    if (count === 0) return null

    const length = total > 0 ? (count / total) * CIRCUMFERENCE : 0
    const offset = -cursor
    cursor += length

    return (
      <circle
        key={status}
        cx="60"
        cy="60"
        r="52"
        fill="none"
        strokeWidth="13"
        strokeLinecap="round"
        stroke={statusStyles[status].hex}
        strokeDasharray={`${drawn ? length : 0} ${CIRCUMFERENCE}`}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dasharray 700ms cubic-bezier(.32,.72,0,1)',
          transitionDelay: `${index * 80}ms`,
        }}
      />
    )
  })

  return (
    <div className="relative size-26 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="size-full -rotate-90"
        role="img"
        aria-label={t('dash.ringLabel', { count: total })}
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="13"
          stroke="rgba(28,28,26,0.07)"
        />
        {arcs}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[30px] font-semibold leading-none text-ink">
          {total}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.04em] text-ink-faint">
          {t('dash.ringUnit')}
        </span>
      </div>
    </div>
  )
}

/** Boş durumun kesikli halkası. */
export function EmptyRing() {
  return (
    <div className="relative mx-auto size-30">
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="13"
          stroke="rgba(28,28,26,0.10)"
          strokeDasharray="4 9"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="tabular text-[30px] font-semibold text-ink-hint">
          0
        </span>
      </div>
    </div>
  )
}
