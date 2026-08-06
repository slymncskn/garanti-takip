import { useI18n } from '@/i18n'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Lang } from '@/i18n'

const options: ReadonlyArray<{ id: Lang; label: string }> = [
  { id: 'tr', label: 'TR' },
  { id: 'en', label: 'EN' },
]

/** İki dilli, sessiz bir anahtar — durum renklerinden uzak dursun diye nötr. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n()

  return (
    <SegmentedControl
      segments={options}
      value={lang}
      onChange={setLang}
      size="sm"
      ariaLabel={t('lang.switch')}
      className={className}
    />
  )
}
