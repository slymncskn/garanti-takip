import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Gruplanmış liste içindeki düzenlenebilir satır: etiket solda sabit
 * genişlikte, değer sağda hizalı. `Field.tsx`'in dikey etiket + kutu düzeni
 * bu ekranlarda kullanılmaz.
 *
 * Not: input yazı boyutu 16 px'in altına indirilmiyor — iOS aksi hâlde
 * alana dokununca sayfayı yakınlaştırıyor.
 */
interface ListFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  mono?: boolean
  error?: string
}

export function ListField({
  label,
  mono = false,
  error,
  className,
  ...rest
}: ListFieldProps) {
  const id = useId()

  return (
    <div className={cn(error && 'bg-critical-soft/60', className)}>
      <div className="flex min-h-12 items-center gap-3 px-4 py-2">
        <label
          htmlFor={id}
          className="w-24 shrink-0 text-[14.5px] text-ink-faint"
        >
          {label}
        </label>
        <input
          id={id}
          className={cn(
            'min-w-0 flex-1 bg-transparent py-1 text-right font-medium text-ink caret-accent',
            'placeholder:font-normal placeholder:text-ink-hint focus:outline-none',
            mono && 'tabular',
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="px-4 pb-2 text-right text-[13px] text-critical">
          {error}
        </p>
      )}
    </div>
  )
}

interface ListTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

/** Çok satırlı alan: etiket üstte, metin altında. */
export function ListTextArea({
  label,
  className,
  ...rest
}: ListTextAreaProps) {
  const id = useId()

  return (
    <div className="px-4 py-3">
      <label
        htmlFor={id}
        className="block text-[14.5px] text-ink-faint"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={cn(
          'mt-1.5 w-full resize-y bg-transparent font-medium text-ink caret-accent',
          'placeholder:font-normal placeholder:text-ink-hint focus:outline-none',
          className,
        )}
        {...rest}
      />
    </div>
  )
}
