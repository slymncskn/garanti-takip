import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent/90 active:bg-accent',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-sunken active:bg-sunken',
  ghost: 'bg-transparent text-ink-soft hover:bg-sunken hover:text-ink',
  danger:
    'bg-surface text-critical border border-critical/30 hover:bg-critical-soft',
}

// Dokunma hedefleri en az 44 px.
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-[15px]',
  lg: 'min-h-13 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
