import type { PaperType, Signature } from '@/types'

interface DrawSignatureOptions {
  ctx: CanvasRenderingContext2D
  sig: Signature
  img: HTMLImageElement
  x: number
  y: number
  w: number
  h: number
}

export function drawSignatureOnCanvas({
  ctx,
  sig,
  img,
  x,
  y,
  w,
  h,
}: DrawSignatureOptions) {
  if (sig.bgOpacity && sig.bgOpacity > 0) {
    drawSignatureBackground(ctx, sig, x, y, w, h)
  }
  ctx.drawImage(img, x, y, w, h)
}

function drawSignatureBackground(
  ctx: CanvasRenderingContext2D,
  sig: Signature,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save()
  ctx.globalAlpha = sig.bgOpacity

  const paperType = sig.paperType as PaperType
  const pageWidth = sig.width
  const pageHeight = sig.height
  const marginTop = 10
  const marginBottom = 10
  const marginLeft = 10
  const marginRight = 10

  if (paperType === 'kraft') {
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h)
    gradient.addColorStop(0, '#d8bf96')
    gradient.addColorStop(0.5, sig.paperBgColor)
    gradient.addColorStop(1, '#b8986a')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, w, h)
  } else {
    ctx.fillStyle = sig.paperBgColor
    ctx.fillRect(x, y, w, h)
  }

  const scaleX = w / pageWidth
  const scaleY = h / pageHeight

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scaleX, scaleY)

  switch (paperType) {
    case 'line':
      drawLines(ctx, sig.paperLineColor, sig.paperLineSpacing, 0.6, pageWidth, pageHeight, marginTop, marginBottom, marginLeft, marginRight, scaleX)
      break
    case 'grid':
      drawGrid(ctx, sig.paperLineColor, sig.paperLineSpacing, 0.5, pageWidth, pageHeight, marginTop, marginBottom, marginLeft, marginRight, scaleX)
      break
    case 'dotted':
      drawDots(ctx, sig.paperLineColor, sig.paperLineSpacing, pageWidth, pageHeight, marginTop, marginBottom, marginLeft, marginRight, scaleX)
      break
    default:
      break
  }

  ctx.restore()
  ctx.restore()
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  color: string,
  spacing: number,
  baseWidth: number,
  pageWidth: number,
  pageHeight: number,
  top: number,
  bottom: number,
  left: number,
  right: number,
  scaleX: number
) {
  ctx.strokeStyle = color
  ctx.lineWidth = baseWidth / scaleX
  for (let y = top; y <= pageHeight - bottom; y += spacing) {
    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(pageWidth - right, y)
    ctx.stroke()
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  color: string,
  spacing: number,
  baseWidth: number,
  pageWidth: number,
  pageHeight: number,
  top: number,
  bottom: number,
  left: number,
  right: number,
  scaleX: number
) {
  ctx.strokeStyle = color
  ctx.lineWidth = baseWidth / scaleX
  for (let y = top; y <= pageHeight - bottom; y += spacing) {
    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(pageWidth - right, y)
    ctx.stroke()
  }
  for (let x = left; x <= pageWidth - right; x += spacing) {
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, pageHeight - bottom)
    ctx.stroke()
  }
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  color: string,
  spacing: number,
  pageWidth: number,
  pageHeight: number,
  top: number,
  bottom: number,
  left: number,
  right: number,
  scaleX: number
) {
  ctx.fillStyle = color
  const r = 0.8 / scaleX
  for (let y = top; y <= pageHeight - bottom; y += spacing) {
    for (let x = left; x <= pageWidth - right; x += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

interface DrawSignaturesForPageOptions {
  ctx: CanvasRenderingContext2D
  pageIdx: number
  signatures: Signature[]
  signaturePlacements: { signatureId: string; pageIndex: number; x: number; y: number; scale: number }[]
  signatureImages: Record<string, HTMLImageElement>
}

export function drawSignaturesForPage({
  ctx,
  pageIdx,
  signatures,
  signaturePlacements,
  signatureImages,
}: DrawSignaturesForPageOptions) {
  const placements = signaturePlacements.filter((p) => p.pageIndex === pageIdx)
  placements.forEach((placement) => {
    const sig = signatures.find((s) => s.id === placement.signatureId)
    const img = signatureImages[placement.signatureId]
    if (!sig || !img) return

    const w = sig.width * placement.scale
    const h = sig.height * placement.scale
    const x = placement.x - w / 2
    const y = placement.y - h / 2

    drawSignatureOnCanvas({ ctx, sig, img, x, y, w, h })
  })
}

export interface SignatureBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export function getSignatureBounds(
  canvas: HTMLCanvasElement,
  bgIsWhite: boolean = true
): SignatureBounds {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { left: 0, top: 0, right: canvas.width, bottom: canvas.height }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let left = canvas.width
  let top = canvas.height
  let right = 0
  let bottom = 0

  const bgR = bgIsWhite ? 255 : 0
  const bgG = bgIsWhite ? 255 : 0
  const bgB = bgIsWhite ? 255 : 0

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]

      const isNotBg = Math.abs(r - bgR) > 30 || Math.abs(g - bgG) > 30 || Math.abs(b - bgB) > 30

      if (a > 50 && isNotBg) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }

  if (right === 0) {
    return { left: 0, top: 0, right: canvas.width, bottom: canvas.height }
  }

  return { left, top, right, bottom }
}

export function extractSignatureDataUrl(
  sourceCanvas: HTMLCanvasElement,
  bounds: SignatureBounds,
  padding: number = 10,
  bgIsWhite: boolean = true
): { dataUrl: string; width: number; height: number } {
  const { left, top, right, bottom } = bounds
  const width = right - left + padding * 2
  const height = bottom - top + padding * 2

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) {
    return { dataUrl: sourceCanvas.toDataURL('image/png'), width: sourceCanvas.width, height: sourceCanvas.height }
  }

  tempCtx.clearRect(0, 0, width, height)
  tempCtx.drawImage(sourceCanvas, left - padding, top - padding, width, height, 0, 0, width, height)

  const imageData = tempCtx.getImageData(0, 0, width, height)
  const data = imageData.data

  const bgR = bgIsWhite ? 255 : 0
  const bgG = bgIsWhite ? 255 : 0
  const bgB = bgIsWhite ? 255 : 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const isBg = Math.abs(r - bgR) <= 30 && Math.abs(g - bgG) <= 30 && Math.abs(b - bgB) <= 30
    if (isBg) {
      data[i + 3] = 0
    }
  }

  tempCtx.putImageData(imageData, 0, 0)

  return {
    dataUrl: tempCanvas.toDataURL('image/png'),
    width,
    height,
  }
}

export async function loadSignatureImages(
  signatures: Signature[]
): Promise<Record<string, HTMLImageElement>> {
  const images: Record<string, HTMLImageElement> = {}
  for (const sig of signatures) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = sig.dataUrl
      })
      images[sig.id] = img
    } catch {
      // skip failed images
    }
  }
  return images
}
