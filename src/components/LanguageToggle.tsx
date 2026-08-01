import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import type { Lang } from '@/i18n'

const options: Array<{ id: Lang; label: string }> = [
  { id: 'tr', label: 'TR' },
  { id: 'en', label: 'EN' },
]

/** İki dilli, sessiz bir anahtar — durum renklerinden uzak dursun diye nötr. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('lang.switch')}
      className={cn(
        'inline-flex items-center rounded-full bg-sunken p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const active = lang === option.id
        return (
          <button
            key={option.id}
            type="button"
            lang={option.id}
            aria-pressed={active}
            onClick={() => setLang(option.id)}
            className={cn(
              'tabular min-h-9 rounded-full px-2.5 text-[12px] font-semibold transition-colors',
              active
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-faint hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
