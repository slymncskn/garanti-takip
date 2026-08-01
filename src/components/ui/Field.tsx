import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full min-h-11 rounded-xl border border-line-strong bg-surface px-3 py-2 ' +
  'placeholder:text-ink-faint transition-colors ' +
  'focus:border-accent focus-visible:outline-2 focus-visible:outline-accent'

interface FieldShellProps {
  label: string
  hint?: string
  error?: string
  children: (id: string) => ReactNode
}

export function Field({ label, hint, error, children }: FieldShellProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-[13px] text-critical">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  /** Rakam ve tarihler monospace okunur. */
  numeric?: boolean
}

export function TextField({
  label,
  hint,
  error,
  numeric,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => (
        <input
          id={id}
          className={cn(control, numeric && 'tabular', className)}
          {...rest}
        />
      )}
    </Field>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
}

export function TextAreaField({
  label,
  hint,
  className,
  ...rest
}: TextAreaProps) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <textarea
          id={id}
          rows={3}
          className={cn(control, 'resize-y', className)}
          {...rest}
        />
      )}
    </Field>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  children: ReactNode
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select id={id} className={cn(control, className)} {...rest}>
          {children}
        </select>
      )}
    </Field>
  )
}
