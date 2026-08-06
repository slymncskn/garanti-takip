import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Üst çubuk. İçerik altından kaydıkça alt kenara ince bir çizgi gelir —
 * iOS'un "scroll edge" davranışı.
 */
export function NavBar({
  left,
  title,
  right,
}: {
  left?: ReactNode
  title?: ReactNode
  right?: ReactNode
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'glass-bar safe-top sticky top-0 z-30 transition-colors duration-200',
        scrolled && 'border-b-[0.5px] border-ink/[0.09]',
      )}
    >
      <div className="mx-auto flex h-12 max-w-2xl items-center gap-2 px-3">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          {left}
        </div>
        {title && (
          <div className="min-w-0 flex-1 truncate text-center text-[16px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          {right}
        </div>
      </div>
    </header>
  )
}

/** Nav bar aksiyonu — 17/400 accent, dokunma hedefi korunur. */
export function NavAction({
  children,
  onClick,
  type = 'button',
  disabled = false,
  strong = false,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  strong?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'press -mx-2 flex min-h-11 items-center gap-1 rounded-full px-2 text-[17px]',
        strong ? 'font-semibold' : 'font-normal',
        disabled ? 'text-ink-hint' : 'text-accent',
      )}
    >
      {children}
    </button>
  )
}
