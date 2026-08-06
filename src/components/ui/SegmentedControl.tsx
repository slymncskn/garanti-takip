import { cn } from '@/lib/cn'

export interface Segment<T extends string | number> {
  id: T
  label: string
}

/**
 * iOS segmented control. Seçili segment beyaz kabartma, diğerleri şeffaf.
 * Dokunma hedefi en az 44 px kalır.
 */
export function SegmentedControl<T extends string | number>({
  segments,
  value,
  onChange,
  size = 'md',
  ariaLabel,
  className,
}: {
  segments: ReadonlyArray<Segment<T>>
  value: T
  onChange: (next: T) => void
  size?: 'sm' | 'md'
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-ink/[0.06] p-0.5',
        className,
      )}
    >
      {segments.map((segment) => {
        const active = segment.id === value
        return (
          <button
            key={segment.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(segment.id)}
            className={cn(
              'press rounded-full font-semibold transition-colors',
              size === 'sm'
                ? 'tabular min-h-9 px-2.5 text-[12px]'
                : 'min-h-11 flex-1 px-3 text-[14px]',
              active
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(28,28,26,0.14)]'
                : 'text-ink-faint hover:text-ink',
            )}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
