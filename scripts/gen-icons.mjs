/**
 * PWA ikonlarını üretir: `npm run icons`
 *
 * Dışarıdan bir görsel işleme kütüphanesi çekmemek için PNG'ler zlib ile
 * elle yazılıyor. İkon, uygulamanın imza öğesini taşır: üç süre şeridi,
 * soldan sağa dolan ve rengi kritikleşen.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconDir = join(root, 'public', 'icons')

const BG = [0x24, 0x41, 0x3f]
const RAIL = [0x3c, 0x58, 0x55]
const FILLS = [
  { ratio: 0.34, color: [0x4f, 0xbf, 0x94] },
  { ratio: 0.66, color: [0xe2, 0xb4, 0x5c] },
  { ratio: 0.93, color: [0xef, 0x6f, 0x70] },
]

function drawIcon(size, inset) {
  const px = new Uint8Array(size * size * 4)

  // Zemin
  for (let i = 0; i < size * size; i++) {
    px[i * 4] = BG[0]
    px[i * 4 + 1] = BG[1]
    px[i * 4 + 2] = BG[2]
    px[i * 4 + 3] = 255
  }

  const barLeft = Math.round(size * inset)
  const barRight = size - barLeft
  const barWidth = barRight - barLeft
  const barHeight = Math.max(2, Math.round(size * 0.075))
  const gap = Math.round(barHeight * 1.9)
  const block = FILLS.length * barHeight + (FILLS.length - 1) * gap
  const top = Math.round((size - block) / 2)
  const radius = barHeight / 2

  FILLS.forEach((bar, index) => {
    const y0 = top + index * (barHeight + gap)
    const fillEnd = barLeft + Math.round(barWidth * bar.ratio)

    for (let y = y0; y < y0 + barHeight; y++) {
      for (let x = barLeft; x < barRight; x++) {
        if (!insideRoundedBar(x, y, barLeft, barRight, y0, barHeight, radius)) {
          continue
        }
        const color = x < fillEnd ? bar.color : RAIL
        const i = (y * size + x) * 4
        px[i] = color[0]
        px[i + 1] = color[1]
        px[i + 2] = color[2]
        px[i + 3] = 255
      }
    }
  })

  return px
}

/** Uçları yuvarlatmak için köşe testleri. */
function insideRoundedBar(x, y, left, right, top, height, radius) {
  const cy = top + height / 2
  if (x >= left + radius && x <= right - radius) return true
  const cx = x < left + radius ? left + radius : right - radius
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2
}

function encodePng(size, pixels) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    Buffer.from(pixels.buffer, y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    )
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

mkdirSync(iconDir, { recursive: true })

const targets = [
  { file: join(iconDir, 'icon-192.png'), size: 192, inset: 0.16 },
  { file: join(iconDir, 'icon-512.png'), size: 512, inset: 0.16 },
  // Maskable ikonun kenarları kırpılabilir; içerik %80'lik güvenli alanda.
  { file: join(iconDir, 'icon-maskable-512.png'), size: 512, inset: 0.26 },
  { file: join(root, 'public', 'apple-touch-icon.png'), size: 180, inset: 0.16 },
]

for (const target of targets) {
  writeFileSync(target.file, encodePng(target.size, drawIcon(target.size, target.inset)))
  console.log(`yazıldı: ${target.file}`)
}
