import type { ReactNode } from 'react'

/** Boş ekranlar davet edici olsun, ne yapılacağını söylesin. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface/60 px-5 py-10 text-center">
      <p className="font-display text-[17px] font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-ink-soft">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorNote({
  title = 'Bir şeyler ters gitti',
  description,
  action,
}: {
  title?: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-card border border-critical/25 bg-critical-soft/60 px-4 py-4">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 text-[14px] text-ink-soft">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
