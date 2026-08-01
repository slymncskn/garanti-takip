import { useEffect, useRef, useState } from 'react'
import { useUploads } from '@/hooks/useUploads'
import { cn } from '@/lib/cn'

/**
 * Tek kalıcı aksiyon, üç kaynak: kamera, galeri, dosya.
 * Mobilde alt köşede sabit durur; masaüstünde de aynı yerde.
 */
export function UploadButton() {
  const [open, setOpen] = useState(false)
  const { addFiles, busy } = useUploads()

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function pick(input: HTMLInputElement | null) {
    setOpen(false)
    input?.click()
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) addFiles(files)
    // Aynı dosya tekrar seçilebilsin diye alanı sıfırla.
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={onChange}
        className="hidden"
      />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/25"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end gap-2 p-4 safe-bottom">
        {open && (
          <div
            role="menu"
            aria-label="Fiş ekle"
            className="mb-1 flex w-56 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-lg"
          >
            <SheetItem onClick={() => pick(cameraRef.current)}>
              Fotoğraf çek
            </SheetItem>
            <SheetItem onClick={() => pick(galleryRef.current)}>
              Galeriden seç
            </SheetItem>
            <SheetItem onClick={() => pick(fileRef.current)}>
              Dosya seç (PDF)
            </SheetItem>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Kapat' : 'Fiş ekle'}
          className={cn(
            'flex size-14 items-center justify-center rounded-full bg-accent text-white shadow-lg',
            'transition-transform duration-150 active:scale-95',
          )}
        >
          {busy ? (
            <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <PlusIcon className={cn('size-6 transition-transform', open && 'rotate-45')} />
          )}
        </button>
      </div>
    </>
  )
}

function SheetItem({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="min-h-12 border-b border-line px-4 text-left text-[15px] text-ink transition-colors last:border-b-0 hover:bg-sunken active:bg-sunken"
    >
      {children}
    </button>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
