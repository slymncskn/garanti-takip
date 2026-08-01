import { dictionaries } from '@/i18n/dictionary'
import { getLang, intlLocale } from '@/i18n/locale'
import type { WarrantyStatus } from '@/types/app'

/**
 * Tarih, para ve "42 gün kaldı" metinleri.
 *
 * Bunlar saf fonksiyon; dili bileşenlerden parametre olarak almak yerine
 * `i18n/locale` içindeki etkin dili okuyorlar. Render sırasında çağrıldıkları
 * için dil değiştiğinde doğru sonucu üretirler.
 */

function s(key: keyof typeof dictionaries.tr, params?: Record<string, string | number>) {
  const text = dictionaries[getLang()][key]
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  )
}

/** `2024-03-08` → `08.03.2024` (tr) / `08/03/2024` (en) */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  if (!d) return '—'
  return new Intl.DateTimeFormat(intlLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/** `2024-03-08` → `8 Mart 2024` / `8 March 2024` */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  if (!d) return '—'
  return new Intl.DateTimeFormat(intlLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatMoney(
  amount: number | null | undefined,
  currency = 'TRY',
): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat(intlLocale(), {
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
    if (past === 1) return s('time.expiredYesterday')
    if (past < 45) return s('time.expiredDays', { n: past })
    if (past < 365) return s('time.expiredMonths', { n: Math.round(past / 30) })
    return s('time.expiredYears', { n: Math.floor(past / 365) })
  }
  if (daysLeft === 0) return s('time.today')
  if (daysLeft === 1) return s('time.tomorrow')
  if (daysLeft < 45) return s('time.daysLeft', { n: daysLeft })
  if (daysLeft < 365) return s('time.monthsLeft', { n: Math.round(daysLeft / 30) })

  const years = Math.floor(daysLeft / 365)
  const months = Math.round((daysLeft % 365) / 30)
  if (months === 0) return s('time.yearsLeft', { n: years })
  if (months === 12) return s('time.yearsLeft', { n: years + 1 })
  return s('time.yearsMonthsLeft', { y: years, m: months })
}

/** Kısa rozet metni — kart üstünde tek bakışta okunur. */
export function remainingShort(daysLeft: number): string {
  if (daysLeft < 0) return s('time.shortExpired')
  if (daysLeft === 0) return s('time.shortToday')
  if (daysLeft < 100) return s('time.shortDays', { n: daysLeft })
  if (daysLeft < 365) return s('time.shortMonths', { n: Math.round(daysLeft / 30) })
  return s('time.shortYears', { n: Math.floor(daysLeft / 365) })
}

export function statusLabel(status: WarrantyStatus): string {
  return s(`status.${status}` as const)
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
  if (months === 0) return s('warranty.none')
  if (months % 12 === 0) return s('warranty.year', { n: months / 12 })
  return s('warranty.monthCount', { n: months })
}
