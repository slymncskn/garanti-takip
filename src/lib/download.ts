import type { ProductRow } from '@/types/app'

/**
 * İndirilen fiş dosyasının adı. Türkçe harfler ASCII'ye indirgeniyor —
 * dosya adı her işletim sisteminde ve `Content-Disposition` başlığında
 * sorunsuz dursun.
 */
export function downloadName(product: ProductRow): string {
  const extension = product.file_path?.split('.').pop()?.toLowerCase() || 'jpg'

  const base = (product.name || product.merchant || 'fis')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  return `fis-${base || 'kayit'}-${product.purchase_date}.${extension}`
}
