import type { WarrantyStatus } from '@/types/app'

/**
 * Durum renkleri paletin omurgası. Kırmızı yalnızca `critical` içindir —
 * her şey acilse hiçbir şey acil değildir.
 *
 * Sınıf adları Tailwind'in tarayabilmesi için birebir yazılır.
 */
export const statusStyles: Record<
  WarrantyStatus,
  { bar: string; rail: string; text: string; chip: string; ring: string }
> = {
  active: {
    bar: 'bg-active',
    rail: 'bg-active-soft',
    text: 'text-active',
    chip: 'bg-active-soft text-active',
    ring: 'ring-active/20',
  },
  soon: {
    bar: 'bg-soon',
    rail: 'bg-soon-soft',
    text: 'text-soon',
    chip: 'bg-soon-soft text-soon',
    ring: 'ring-soon/20',
  },
  warning: {
    bar: 'bg-warning',
    rail: 'bg-warning-soft',
    text: 'text-warning',
    chip: 'bg-warning-soft text-warning',
    ring: 'ring-warning/25',
  },
  critical: {
    bar: 'bg-critical',
    rail: 'bg-critical-soft',
    text: 'text-critical',
    chip: 'bg-critical-soft text-critical',
    ring: 'ring-critical/30',
  },
  expired: {
    bar: 'bg-expired',
    rail: 'bg-expired-soft',
    text: 'text-expired',
    chip: 'bg-expired-soft text-expired',
    ring: 'ring-expired/20',
  },
}
