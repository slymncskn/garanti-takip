import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionSheet, SheetRow } from '@/components/ui/ActionSheet'
import { useUploads } from '@/hooks/useUploads'
import { useI18n } from '@/i18n'

/**
 * Fiş ekleme sheet'i. Üç gizli `<input>` ve `useUploads().addFiles` akışı
 * eskisiyle aynı; değişen yalnızca sunum — FAB + açılır menü yerine
 * iOS action sheet.
 */
export function UploadSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addFiles } = useUploads()
  const { t } = useI18n()
  const navigate = useNavigate()

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function pick(input: HTMLInputElement | null) {
    onClose()
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

      <ActionSheet
        open={open}
        onClose={onClose}
        title={t('upload.add')}
        description={t('upload.sheetHint')}
        cancelLabel={t('common.cancel')}
      >
        <SheetRow
          icon={<CameraIcon />}
          iconClassName="bg-active-soft text-active"
          label={t('upload.camera')}
          onClick={() => pick(cameraRef.current)}
        />
        <SheetRow
          icon={<PhotoIcon />}
          iconClassName="bg-accent-soft text-accent"
          label={t('upload.gallery')}
          onClick={() => pick(galleryRef.current)}
        />
        <SheetRow
          icon={<DocIcon />}
          iconClassName="bg-sunken text-ink-soft"
          label={t('upload.file')}
          onClick={() => pick(fileRef.current)}
        />
        <SheetRow
          icon={<PlusIcon />}
          iconClassName="bg-soon-soft text-soon"
          label={t('receipt.manual')}
          hint={t('upload.manualHint')}
          onClick={() => {
            onClose()
            navigate('/yeni')
          }}
        />
      </ActionSheet>
    </>
  )
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-4',
  'aria-hidden': true,
}

function CameraIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 4.5-4.5 3.5 3 3-2.5L20 17" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13 3v5h5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg {...iconProps} strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
