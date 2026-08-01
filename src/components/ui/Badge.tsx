import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { statusStyles } from '@/lib/status'
import { statusLabel } from '@/lib/format'
import type { WarrantyStatus } from '@/types/app'

export function StatusBadge({
  status,
  children,
}: {
  status: WarrantyStatus
  children?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium',
        statusStyles[status].chip,
      )}
    >
      {children ?? statusLabel[status]}
    </span>
  )
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-sunken px-2 py-0.5 text-[12px] text-ink-soft',
        className,
      )}
    >
      {children}
    </span>
  )
}
