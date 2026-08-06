import { useState } from 'react'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/** Dört sütuna sığması için preset'ler 12 / 24 / 36 + Diğer. */
const presets = [12, 24, 36]

/**
 * Garanti süresi seçimi. 24 ay varsayılan; kullanıcı çoğu zaman tek
 * dokunuşla geçebilmeli, gerekirse özel süre yazabilmeli.
 */
export function WarrantyPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (months: number) => void
}) {
  const { t } = useI18n()
  const [custom, setCustom] = useState(!presets.includes(value))

  return (
    <div className="px-4 py-3">
      <span className="block text-[14.5px] text-ink-faint">
        {t('warranty.label')}
      </span>

      <div className="mt-2.5 flex gap-1.5">
        {presets.map((months) => {
          const selected = !custom && value === months
          return (
            <button
              key={months}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCustom(false)
                onChange(months)
              }}
              className={cn(
                'press min-h-11 flex-1 rounded-xl py-2.5 text-[14px] transition-colors',
                selected
                  ? 'bg-ink font-semibold text-paper'
                  : 'bg-ink/[0.05] font-medium text-ink-soft',
              )}
            >
              <span className="tabular">{months}</span> {t('warranty.months')}
            </button>
          )
        })}

        <button
          type="button"
          aria-pressed={custom}
          onClick={() => setCustom(true)}
          className={cn(
            'press min-h-11 flex-1 rounded-xl py-2.5 text-[14px] transition-colors',
            custom
              ? 'bg-ink font-semibold text-paper'
              : 'bg-ink/[0.05] font-medium text-ink-soft',
          )}
        >
          {t('warranty.custom')}
        </button>
      </div>

      {custom && (
        <div className="mt-2.5 flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={240}
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={t('warranty.label')}
            className="tabular min-h-11 w-24 rounded-xl bg-ink/[0.05] px-3 text-center font-medium text-ink caret-accent focus:outline-none"
          />
          <span className="text-[14px] text-ink-soft">
            {t('warranty.customHint')}
          </span>
        </div>
      )}
    </div>
  )
}
