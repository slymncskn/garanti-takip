import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const ENTER_MS = 320
const EXIT_MS = 240
/** Bu kadar aşağı sürüklenince kapanır. */
const DISMISS_PX = 60

/**
 * iOS action sheet. Alttan girer, arka planı karartıp bulanıklaştırır,
 * Escape / arka plana dokunma / aşağı sürükleme ile kapanır.
 */
export function ActionSheet({
  open,
  onClose,
  title,
  description,
  children,
  cancelLabel,
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  cancelLabel: string
}) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const [drag, setDrag] = useState(0)
  const startY = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const timer = setTimeout(() => {
      setMounted(false)
      setDrag(0)
    }, EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (shown) panelRef.current?.focus()
  }, [shown])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startY.current === null) return
    setDrag(Math.max(0, e.clientY - startY.current))
  }, [])

  const onPointerUp = useCallback(() => {
    if (startY.current === null) return
    startY.current = null
    setDrag((current) => {
      if (current > DISMISS_PX) onClose()
      return 0
    })
  }, [onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={cancelLabel}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-200',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-2.5 outline-none"
        style={{
          // Güvenli alan boşluğu sheet'in tamamını yukarı kaldırır.
          // Bunu İptal düğmesinin iç boşluğuna verirsek metin, kalan
          // alanın ortasına hizalanır ve yukarıda kalmış gibi görünür.
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
          transform: shown ? `translateY(${drag}px)` : 'translateY(110%)',
          transition:
            startY.current === null
              ? `transform ${shown ? ENTER_MS : EXIT_MS}ms cubic-bezier(.32,.72,0,1)`
              : 'none',
        }}
      >
        <div
          className="glass-chrome shadow-sheet overflow-hidden rounded-[26px]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {(title || description) && (
            <div className="px-5 pb-3 pt-4 text-center">
              {/* Sürükleme tutamağı */}
              <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-ink/15" />
              {title && (
                <p className="text-[15px] font-semibold text-ink">{title}</p>
              )}
              {description && (
                <p className="mt-0.5 text-[12.5px] text-ink-faint">
                  {description}
                </p>
              )}
            </div>
          )}
          <div className="list-group border-t-[0.5px] border-ink/[0.07]">
            {children}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="press mt-2 flex h-14 w-full items-center justify-center rounded-[22px] bg-white/90 text-[17px] font-semibold text-ink backdrop-blur-xl"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}

/** Sheet içindeki tek aksiyon satırı: renkli ikon karesi + etiket + chevron. */
export function SheetRow({
  icon,
  iconClassName,
  label,
  hint,
  onClick,
}: {
  icon: ReactNode
  iconClassName: string
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press-row flex min-h-13 w-full items-center gap-3 px-4 py-2.5 text-left"
    >
      <span
        className={cn(
          'flex size-[30px] shrink-0 items-center justify-center rounded-[9px]',
          iconClassName,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] text-ink">{label}</span>
        {hint && (
          <span className="block text-[12.5px] text-ink-faint">{hint}</span>
        )}
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 shrink-0 text-ink-hint"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  )
}

/** Yıkıcı onay satırı (ör. silme). */
export function SheetDestructive({
  label,
  onClick,
  busy = false,
}: {
  label: string
  onClick: () => void
  busy?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="press-row flex min-h-13 w-full items-center justify-center px-4 py-3 text-[17px] font-semibold text-critical disabled:opacity-50"
    >
      {label}
    </button>
  )
}
