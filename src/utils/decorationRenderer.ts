import type { DecorationPreset, DecorationPlacement } from '@/types'
import { decorationPresets } from '@/constants/decorationPresets'

export interface DecorationImageCache {
  [key: string]: HTMLImageElement
}

export async function loadDecorationImages(
  decorations: DecorationPreset[]
): Promise<DecorationImageCache> {
  const cache: DecorationImageCache = {}
  const promises = decorations.map(async (d) => {
    const img = new Image()
    const svgBlob = new Blob([d.svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    return new Promise<{ id: string; img: HTMLImageElement }>((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ id: d.id, img })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ id: d.id, img })
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

    let img = decorationImages[placement.decorationId]

    ctx.save()
    ctx.globalAlpha = placement.opacity
    ctx.translate(placement.x, placement.y)
    ctx.rotate((placement.rotation * Math.PI) / 180)

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -placement.width / 2, -placement.height / 2, placement.width, placement.height)
    } else {
      const tmpImg = new Image()
      tmpImg.src = svgToDataUrl(preset.svgContent)
      if (tmpImg.complete && tmpImg.naturalWidth > 0) {
        ctx.drawImage(tmpImg, -placement.width / 2, -placement.height / 2, placement.width, placement.height)
      }
    }
    ctx.restore()
  }
}
