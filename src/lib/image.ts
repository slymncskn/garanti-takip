/** Uzun kenar hedefi. OCR doğruluğu bu boyutta düşmüyor. */
const MAX_EDGE = 1600
const JPEG_QUALITY = 0.85

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
] as const

export interface PreparedFile {
  blob: Blob
  /** Storage'a yazılacak MIME tipi. */
  contentType: string
  extension: string
}

/**
 * Yüklemeye hazırlar: görselleri 1600 px'e küçültüp JPEG'e çevirir,
 * PDF'e dokunmaz.
 *
 * Telefon fotoğrafları 3–5 MB geliyor; küçültme ücretsiz depolama kotasını
 * korumak için zorunlu. Tarayıcı görseli çözemezse (ör. bazı HEIC dosyaları)
 * dosya olduğu gibi yüklenir — kayıp yaşamaktansa büyük yüklemek yeğdir.
 */
export async function prepareForUpload(file: File): Promise<PreparedFile> {
  if (file.type === 'application/pdf') {
    return { blob: file, contentType: 'application/pdf', extension: 'pdf' }
  }

  try {
    const bitmap = await decode(file)
    const { width, height } = fit(bitmap.width, bitmap.height)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas yok')
    ctx.drawImage(bitmap, 0, 0, width, height)
    if ('close' in bitmap) bitmap.close()

    const blob = await toBlob(canvas)
    return { blob, contentType: 'image/jpeg', extension: 'jpg' }
  } catch {
    return {
      blob: file,
      // Bucket `image/heif`'i kabul etmiyor, `image/heic`'i ediyor; aynı
      // biçimin iki adı olduğu için yükleme boşuna reddedilmesin.
      contentType:
        file.type === 'image/heif'
          ? 'image/heic'
          : file.type || 'application/octet-stream',
      extension: extensionOf(file),
    }
  }
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    // EXIF yönü fotoğraflarda yaygın; 'from-image' olmadan yan yatıyor.
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  }

  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('görsel çözülemedi'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function fit(w: number, h: number): { width: number; height: number } {
  const longest = Math.max(w, h)
  if (longest <= MAX_EDGE) return { width: w, height: h }
  const scale = MAX_EDGE / longest
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('görsel dönüştürülemedi')),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5) return fromName.toLowerCase()
  return file.type.split('/').pop() ?? 'bin'
}

/**
 * Storage yolu. Desen zorunlu: `{user_id}/{timestamp}-{rastgele}.{uzantı}`.
 * İlk klasör adı `auth.uid()` ile eşleşmezse Storage RLS yüklemeyi reddeder.
 */
export function buildStoragePath(userId: string, extension: string): string {
  const random = Math.random().toString(36).slice(2, 10)
  return `${userId}/${Date.now()}-${random}.${extension}`
}

/** Kullanıcıya gösterilecek dosya doğrulaması; sorun yoksa null. */
export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) {
    return 'Dosya 10 MB’tan büyük. Daha küçük bir fotoğraf dene.'
  }
  const type = file.type.toLowerCase()
  const ok =
    ACCEPTED_TYPES.includes(type as (typeof ACCEPTED_TYPES)[number]) ||
    type.startsWith('image/')
  if (!ok) {
    return 'Bu dosya tipini okuyamıyorum. Fotoğraf ya da PDF yükle.'
  }
  return null
}
