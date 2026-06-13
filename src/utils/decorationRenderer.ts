import type { DecorationPreset, DecorationPlacement } from '@/types'
import { decorationPresets } from '@/constants/decorationPresets'

export interface DecorationImageCache {
  [key: string]: HTMLImageElement | null
}

export async function loadDecorationImages(
  decorations: DecorationPreset[]
): Promise<DecorationImageCache> {
  const cache: DecorationImageCache = {}
  const promises = decorations.map(async (d) => {
    const img = new Image()
    const svgBlob = new Blob([d.svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    return new Promise<{ id: string; img: HTMLImageElement | null }>((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ id: d.id, img })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ id: d.id, img: null })
      }
      img.src = url
    })
  })
  const results = await Promise.all(promises)
  results.forEach(({ id, img }) => {
    cache[id] = img
  })
  return cache
}

const svgToDataUrl = (svgContent: string): string => {
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

const imageRetryCache = new Map<string, HTMLImageElement>()

function getOrLoadImage(svgContent: string): HTMLImageElement | null {
  const dataUrl = svgToDataUrl(svgContent)

  if (imageRetryCache.has(dataUrl)) {
    const cached = imageRetryCache.get(dataUrl)!
    if (cached.complete && cached.naturalWidth > 0) return cached
    return null
  }

  const img = new Image()
  img.src = dataUrl
  imageRetryCache.set(dataUrl, img)

  if (img.complete && img.naturalWidth > 0) return img
  return null
}

export function drawDecorationsForPage(options: {
  ctx: CanvasRenderingContext2D
  pageIdx: number
  decorationPlacements: DecorationPlacement[]
  decorationImages: DecorationImageCache
}) {
  const { ctx, pageIdx, decorationPlacements, decorationImages } = options

  const pageDecorations = decorationPlacements.filter((d) => d.pageIndex === pageIdx)

  for (const placement of pageDecorations) {
    const preset = decorationPresets.find((p) => p.id === placement.decorationId)
    if (!preset) continue

    const cachedImg = decorationImages[placement.decorationId]
    let drawn = false

    ctx.save()
    ctx.globalAlpha = placement.opacity
    ctx.translate(placement.x, placement.y)
    ctx.rotate((placement.rotation * Math.PI) / 180)

    if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
      ctx.drawImage(cachedImg, -placement.width / 2, -placement.height / 2, placement.width, placement.height)
      drawn = true
    }

    if (!drawn) {
      const retryImg = getOrLoadImage(preset.svgContent)
      if (retryImg) {
        ctx.drawImage(retryImg, -placement.width / 2, -placement.height / 2, placement.width, placement.height)
        drawn = true
      }
    }

    if (!drawn) {
      ctx.fillStyle = 'rgba(200, 160, 100, 0.3)'
      ctx.fillRect(-placement.width / 2, -placement.height / 2, placement.width, placement.height)
      ctx.strokeStyle = 'rgba(180, 140, 80, 0.5)'
      ctx.lineWidth = 1
      ctx.strokeRect(-placement.width / 2, -placement.height / 2, placement.width, placement.height)
    }

    ctx.restore()
  }
}
