import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadReceipt } from '@/api/receipts'
import { validateFile } from '@/lib/image'

export interface UploadItem {
  id: string
  fileName: string
  status: 'preparing' | 'uploading' | 'done' | 'error'
  message?: string
  receiptId?: string
}

interface UploadState {
  items: UploadItem[]
  /** Devam eden yükleme var mı — üst çubuktaki göstergeyi sürer. */
  busy: boolean
  addFiles: (files: File[]) => void
  dismiss: (id: string) => void
}

const UploadContext = createContext<UploadState | null>(null)

/**
 * Yükleme kuyruğu uygulama kökünde durur; kullanıcı yüklerken ekranlar
 * arasında gezinebilsin diye iş bileşenin ömrüne bağlı değil.
 */
export function UploadProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<UploadItem[]>([])
  const qc = useQueryClient()

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...next } : item)),
    )
  }, [])

  const addFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const problem = validateFile(file)

        if (problem) {
          setItems((prev) => [
            ...prev,
            { id, fileName: file.name, status: 'error', message: problem },
          ])
          continue
        }

        setItems((prev) => [
          ...prev,
          { id, fileName: file.name, status: 'preparing' },
        ])

        void (async () => {
          try {
            patch(id, { status: 'uploading' })
            const { receiptId } = await uploadReceipt(file)
            patch(id, { status: 'done', receiptId })
            void qc.invalidateQueries({ queryKey: ['receipts'] })
            // Birkaç saniye sonra kendiliğinden kaybolsun.
            setTimeout(() => {
              setItems((prev) => prev.filter((item) => item.id !== id))
            }, 4000)
          } catch (error) {
            patch(id, {
              status: 'error',
              message:
                error instanceof Error
                  ? 'Yükleme tamamlanamadı. Bağlantını kontrol edip tekrar dene.'
                  : 'Yükleme tamamlanamadı.',
            })
          }
        })()
      }
    },
    [patch, qc],
  )

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const value = useMemo<UploadState>(
    () => ({
      items,
      busy: items.some(
        (i) => i.status === 'preparing' || i.status === 'uploading',
      ),
      addFiles,
      dismiss,
    }),
    [items, addFiles, dismiss],
  )

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUploads(): UploadState {
  const ctx = useContext(UploadContext)
  if (!ctx) throw new Error('useUploads, UploadProvider içinde kullanılmalı')
  return ctx
}
