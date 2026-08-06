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
    <div className="px-4 py-10 text-center">
      <p className="text-[20px] font-bold tracking-[-0.02em] text-ink">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-relaxed text-ink-soft">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorNote({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div
      className="rounded-card px-4 py-4 backdrop-blur-[17px]"
      style={{
        background: 'rgba(253,232,234,0.62)',
        border: '0.5px solid rgba(215,0,21,0.22)',
      }}
    >
      <p className="text-[15.5px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
        {description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
