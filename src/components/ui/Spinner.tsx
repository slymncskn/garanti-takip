import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <span
      role="status"
      aria-label={t('common.loading')}
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

/** Liste beklerken yer tutan sakin blok — içerik zıplamasın. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-card bg-sunken', className)}
      aria-hidden="true"
    />
  )
}
