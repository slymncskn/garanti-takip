import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  children,
  count,
  tone = 'default',
}: {
  children: ReactNode
  count?: number
  tone?: 'default' | 'attention'
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2
        className={cn(
          'text-[13px] font-semibold uppercase tracking-[0.08em]',
          tone === 'attention' ? 'text-ink' : 'text-ink-faint',
        )}
      >
        {children}
      </h2>
      {count !== undefined && (
        <span className="tabular text-[13px] text-ink-faint">{count}</span>
      )}
    </div>
  )
}
