import type { WarrantyStatus } from '@/types/app'

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const longDateFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** `2024-03-08` → `08.03.2024` */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  return d ? dateFmt.format(d) : '—'
}

/** `2024-03-08` → `8 Mart 2024` */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  return d ? longDateFmt.format(d) : '—'
}

export function formatMoney(
  amount: number | null | undefined,
  currency = 'TRY',
): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Tarih alanları için `<input type="date">` değeri. */
export function toDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function todayInput(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function parseDate(iso: string): Date | null {
  // Tarih kolonları saat taşımıyor; UTC olarak okuyup yerel kaymadan kaçınıyoruz.
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * "Ne kadar kaldı" metni. Arayüzün taşıdığı asıl bilgi bu; sayıyı yakın
 * aralıkta gün, uzakta ay/yıl olarak veriyoruz ki tarama kolay olsun.
 */
export function remainingText(daysLeft: number): string {
  if (daysLeft < 0) {
    const past = Math.abs(daysLeft)
    if (past === 1) return 'Dün doldu'
    if (past < 45) return `${past} gün önce doldu`
    if (past < 365) return `${Math.round(past / 30)} ay önce doldu`
    return `${Math.floor(past / 365)} yıldan uzun süredir dolu`
  }
  if (daysLeft === 0) return 'Bugün doluyor'
  if (daysLeft === 1) return 'Yarın doluyor'
  if (daysLeft < 45) return `${daysLeft} gün kaldı`
  if (daysLeft < 365) return `${Math.round(daysLeft / 30)} ay kaldı`

  const years = Math.floor(daysLeft / 365)
  const months = Math.round((daysLeft % 365) / 30)
  if (months === 0) return `${years} yıl kaldı`
  if (months === 12) return `${years + 1} yıl kaldı`
  return `${years} yıl ${months} ay kaldı`
}

/** Kısa rozet metni — kart üstünde tek bakışta okunur. */
export function remainingShort(daysLeft: number): string {
  if (daysLeft < 0) return 'doldu'
  if (daysLeft === 0) return 'bugün'
  if (daysLeft < 100) return `${daysLeft} gün`
  if (daysLeft < 365) return `${Math.round(daysLeft / 30)} ay`
  return `${Math.floor(daysLeft / 365)} yıl+`
}

export const statusLabel: Record<WarrantyStatus, string> = {
  active: 'Sürüyor',
  soon: 'Yaklaşıyor',
  warning: 'Az kaldı',
  critical: 'Kritik',
  expired: 'Doldu',
}

/**
 * Süre şeridinin dolu oranı: satın alma → garanti bitişi aralığında
 * bugünün nerede durduğu. 0–1 arasına kırpılır.
 */
export function elapsedRatio(purchaseDate: string, warrantyEnd: string): number {
  const start = parseDate(purchaseDate)?.getTime()
  const end = parseDate(warrantyEnd)?.getTime()
  if (!start || !end || end <= start) return 1

  const now = Date.now()
  return Math.min(1, Math.max(0, (now - start) / (end - start)))
}

export function warrantyMonthsLabel(months: number): string {
  if (months === 0) return 'Garantisiz'
  if (months % 12 === 0) return `${months / 12} yıl`
  return `${months} ay`
}
