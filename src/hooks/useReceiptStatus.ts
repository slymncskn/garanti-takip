import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/receipts'
import { productKeys } from './useProducts'

export const receiptKeys = {
  open: ['receipts', 'open'] as const,
  detail: (id: string) => ['receipts', 'detail', id] as const,
  signedUrl: (path: string) => ['receipts', 'signed-url', path] as const,
  downloadUrl: (path: string, name: string) =>
    ['receipts', 'download-url', path, name] as const,
}

const POLL_MS = 4000

/**
 * Koşullu polling: yalnızca ekranda `pending` veya `processing` bir fiş
 * varken 4 saniyede bir sorgulanır, hepsi çözülünce durur. Realtime'ın RLS
 * yapılandırması bu ölçekte gereksiz karmaşıklık.
 */
export function useOpenReceipts() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: receiptKeys.open,
    queryFn: api.listOpenReceipts,
    refetchInterval: (q) => {
      const rows = q.state.data ?? []
      const working = rows.some(
        (r) => r.status === 'pending' || r.status === 'processing',
      )
      return working ? POLL_MS : false
    },
    refetchIntervalInBackground: false,
  })

  // Bir fiş `parsed`'a döndüğünde ürünler oluşmuş demektir; listeyi tazele.
  const previous = useRef<string>('')
  useEffect(() => {
    const signature = (query.data ?? [])
      .map((r) => `${r.id}:${r.status}`)
      .join('|')
    if (previous.current && signature !== previous.current) {
      void qc.invalidateQueries({ queryKey: productKeys.all })
    }
    previous.current = signature
  }, [query.data, qc])

  return query
}

export function useReceipt(id: string | undefined) {
  return useQuery({
    queryKey: receiptKeys.detail(id ?? ''),
    queryFn: () => api.getReceipt(id as string),
    enabled: Boolean(id),
  })
}

/** İmzalı URL 1 saat geçerli; süresi dolmadan yeniden alınır. */
export function useSignedUrl(filePath: string | null | undefined) {
  return useQuery({
    queryKey: receiptKeys.signedUrl(filePath ?? ''),
    queryFn: () => api.getSignedUrl(filePath as string),
    enabled: Boolean(filePath),
    staleTime: 50 * 60_000,
    gcTime: 55 * 60_000,
  })
}

/**
 * İndirme bağlantısı sayfa açılırken hazırlanır; düğme böylece gerçek bir
 * `<a href>` olabiliyor. Tıklamadan sonra imzalı URL almak iOS'ta kullanıcı
 * hareketi sayılmadığı için indirmeyi engelleyebilirdi.
 */
export function useDownloadUrl(
  filePath: string | null | undefined,
  fileName: string,
) {
  return useQuery({
    queryKey: receiptKeys.downloadUrl(filePath ?? '', fileName),
    queryFn: () => api.getDownloadUrl(filePath as string, fileName),
    enabled: Boolean(filePath),
    staleTime: 50 * 60_000,
    gcTime: 55 * 60_000,
  })
}

export function useRetryReceipt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.retryReceipt(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['receipts'] })
    },
  })
}

export function useDeleteReceipt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteReceipt(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['receipts'] })
      void qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
