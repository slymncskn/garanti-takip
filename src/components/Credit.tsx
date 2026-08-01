import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/** Yapan kişi künyesi. Metin çevrilmiyor — özel ad ve adres. */
export function Credit({
  withEmail = false,
  className,
}: {
  withEmail?: boolean
  className?: string
}) {
  const { t } = useI18n()

  return (
    <div className={cn('text-center', className)}>
      <p className="text-[12px] leading-relaxed text-ink-faint">
        {t('app.credit')}
      </p>
      {withEmail && (
        <a
          href={`mailto:${t('app.email')}`}
          className="tabular mt-0.5 inline-block text-[12px] text-ink-faint underline-offset-4 hover:text-ink-soft hover:underline"
        >
          {t('app.email')}
        </a>
      )}
    </div>
  )
}
