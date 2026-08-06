import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * iOS'un "gruplanmış inset listesi". Ayırıcılar satırlar arasında,
 * kenarlarda değil; köşeler `overflow-hidden` ile kırpılır.
 */
export function ListGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'list-group glass-surface shadow-list overflow-hidden rounded-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Bölüm başlığı — ALL CAPS, 13/600, ink-faint. */
export function SectionLabel({
  children,
  action,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-2 flex items-baseline justify-between', className)}>
      <h2 className="text-[13px] font-semibold uppercase leading-none tracking-[0.02em] text-ink-faint">
        {children}
      </h2>
      {action}
    </div>
  )
}

/** Sağa bakan chevron — satırın devam ettiğini söyler. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-3.5 shrink-0 text-ink-hint', className)}
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function BackChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      aria-hidden="true"
    >
      <path d="m14 6-6 6 6 6" />
    </svg>
  )
}

/**
 * Etiket solda / değer sağda okuma satırı.
 * Dokunulabilirse `onClick` ya da `to` veren sarmalayıcı kullanılır.
 */
export function ListRow({
  label,
  value,
  mono = false,
  tone,
  trailing,
  className,
}: {
  label: ReactNode
  value?: ReactNode
  mono?: boolean
  tone?: string
  trailing?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-11 items-center justify-between gap-4 px-4 py-3',
        className,
      )}
    >
      <span className="text-[14.5px] text-ink-faint">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        {value !== undefined && (
          <span
            className={cn(
              'truncate text-right text-[15.5px] font-medium',
              mono && 'tabular text-[14.5px]',
              tone ?? 'text-ink',
            )}
          >
            {value}
          </span>
        )}
        {trailing}
      </span>
    </div>
  )
}

/** Tam satırı kaplayan aksiyon (ör. "Ürünü sil"). */
export function ListAction({
  children,
  onClick,
  tone = 'text-ink',
  trailing,
}: {
  children: ReactNode
  onClick: () => void
  tone?: string
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press-row flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15.5px] font-medium',
        tone,
      )}
    >
      {children}
      {trailing}
    </button>
  )
}
