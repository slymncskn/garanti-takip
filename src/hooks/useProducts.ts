import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import * as api from '@/api/products'
import type { ProductDraft, ProductRow } from '@/types/app'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  byReceipt: (receiptId: string) => ['products', 'receipt', receiptId] as const,
  search: (q: string) => ['products', 'search', q] as const,
}

export function useProducts(): UseQueryResult<ProductRow[]> {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: api.listProducts,
    staleTime: 30_000,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => api.getProduct(id as string),
    enabled: Boolean(id),
  })
}

export function useProductsByReceipt(receiptId: string | undefined) {
  return useQuery({
    queryKey: productKeys.byReceipt(receiptId ?? ''),
    queryFn: () => api.listProductsByReceipt(receiptId as string),
    enabled: Boolean(receiptId),
  })
}

export function useProductSearch(term: string) {
  return useQuery({
    queryKey: productKeys.search(term),
    queryFn: () => api.searchProducts(term),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: ProductDraft) => api.createProduct(draft),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: ProductDraft) => api.updateProduct(id, draft),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all })
      void qc.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useConfirmReceipt(receiptId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (drafts: ProductDraft[]) => api.confirmReceipt(receiptId, drafts),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      void qc.invalidateQueries({ queryKey: ['receipts'] })
    },
  })
}

/** Ana sayfanın üç bölümü tek sorgudan türetilir. */
export function splitProducts(products: ProductRow[]) {
  const awaitingConfirmation = products.filter(
    (p) => p.receipt_status === 'parsed' && !p.is_confirmed,
  )
  const confirmed = products.filter((p) => p.is_confirmed)
  const expiringSoon = confirmed
    .filter((p) => p.days_left <= 90)
    .sort((a, b) => a.days_left - b.days_left)

  return { awaitingConfirmation, expiringSoon, all: confirmed }
}
