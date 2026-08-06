import type { WarrantyStatus } from '@/types/app'

/**
 * Durum renkleri paletin omurgası. Kırmızı yalnızca `critical` içindir —
 * her şey acilse hiçbir şey acil değildir.
 *
 * Sınıf adları Tailwind'in tarayabilmesi için birebir yazılır.
 * `wash`, ekranın arka plan yıkamasını sürükleyen ham rgba değeridir.
 */
export const statusStyles: Record<
  WarrantyStatus,
  {
    bar: string
    rail: string
    text: string
    chip: string
    ring: string
    /** SVG ve gradyan için ham hex. */
    hex: string
    wash: string
  }
> = {
  active: {
    bar: 'bg-active',
    rail: 'bg-active-soft',
    text: 'text-active',
    chip: 'bg-active-soft text-active',
    ring: 'ring-active/20',
    hex: '#248a3d',
    wash: 'rgba(36,138,61,0.16)',
  },
  soon: {
    bar: 'bg-soon',
    rail: 'bg-soon-soft',
    text: 'text-soon',
    chip: 'bg-soon-soft text-soon',
    ring: 'ring-soon/20',
    hex: '#b25000',
    wash: 'rgba(178,80,0,0.16)',
  },
  warning: {
    bar: 'bg-warning',
    rail: 'bg-warning-soft',
    text: 'text-warning',
    chip: 'bg-warning-soft text-warning',
    ring: 'ring-warning/25',
    hex: '#c93400',
    wash: 'rgba(201,52,0,0.17)',
  },
  critical: {
    bar: 'bg-critical',
    rail: 'bg-critical-soft',
    text: 'text-critical',
    chip: 'bg-critical-soft text-critical',
    ring: 'ring-critical/30',
    hex: '#d70015',
    wash: 'rgba(215,0,21,0.18)',
  },
  expired: {
    bar: 'bg-expired',
    rail: 'bg-expired-soft',
    text: 'text-expired',
    chip: 'bg-expired-soft text-expired',
    ring: 'ring-expired/20',
    hex: '#8e8e93',
    wash: 'rgba(142,142,147,0.16)',
  },
}
