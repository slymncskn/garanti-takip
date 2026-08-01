import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/** Yapan kişi künyesi. Metin çevrilmiyor — özel ad. */
export function Credit({ className }: { className?: string }) {
  const { t } = useI18n()

  return (
    <p className={cn('text-center text-[12px] text-ink-faint', className)}>
      {t('app.credit')}
    </p>
  )
}
