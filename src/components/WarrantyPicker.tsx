import { useState } from 'react'
import { cn } from '@/lib/cn'
import { warrantyMonthsLabel } from '@/lib/format'

const presets = [12, 24, 36, 60]

/**
 * Garanti süresi hızlı seçimi. 24 ay varsayılan; kullanıcı çoğu zaman tek
 * dokunuşla geçebilmeli, gerekirse özel süre yazabilmeli.
 */
export function WarrantyPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (months: number) => void
}) {
  const [custom, setCustom] = useState(!presets.includes(value))

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink-soft">
        Garanti süresi
      </span>

      <div className="flex flex-wrap gap-1.5">
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
                'min-h-11 rounded-xl px-3.5 text-[14px] font-medium transition-colors',
                selected
                  ? 'bg-ink text-paper'
                  : 'bg-sunken text-ink-soft hover:text-ink',
              )}
            >
              <span className="tabular">{months}</span> ay
            </button>
          )
        })}

        <button
          type="button"
          aria-pressed={custom}
          onClick={() => setCustom(true)}
          className={cn(
            'min-h-11 rounded-xl px-3.5 text-[14px] font-medium transition-colors',
            custom
              ? 'bg-ink text-paper'
              : 'bg-sunken text-ink-soft hover:text-ink',
          )}
        >
          Özel
        </button>
      </div>

      {custom ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={240}
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label="Garanti süresi (ay)"
            className="tabular w-28 min-h-11 rounded-xl border border-line-strong bg-surface px-3 py-2 focus:border-accent"
          />
          <span className="text-[14px] text-ink-soft">ay (0–240)</span>
        </div>
      ) : (
        <p className="text-[13px] text-ink-faint">
          {warrantyMonthsLabel(value)} garanti
        </p>
      )}
    </div>
  )
}
