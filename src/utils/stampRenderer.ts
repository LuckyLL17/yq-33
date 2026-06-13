import type { Stamp, StampConfig, StampShape, StampPlacement } from '@/store/useWorkspaceStore'

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  color: string,
  rotation: number = -Math.PI / 2
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const outerAngle = rotation + (i * 2 * Math.PI) / 5
    const innerAngle = rotation + ((2 * i + 1) * Math.PI) / 5
    if (i === 0) {
      ctx.moveTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle))
    } else {
      ctx.lineTo(cx + outerR * Math.cos(outerAngle), cy + outerR * Math.sin(outerAngle))
    }
    ctx.lineTo(cx + innerR * Math.cos(innerAngle), cy + innerR * Math.sin(innerAngle))
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  shape: StampShape,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  borderWidth: number,
  borderStyle: string,
  color: string
) {
  if (borderStyle === 'none') return

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = borderWidth

  if (borderStyle === 'dashed') {
    ctx.setLineDash([borderWidth * 3, borderWidth * 2])
  }

  const drawOneBorder = () => {
    ctx.beginPath()
    if (shape === 'circle') {
      ctx.arc(cx, cy, rx, 0, Math.PI * 2)
    } else if (shape === 'ellipse') {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    } else {
      const s = rx * 2
      const r = s * 0.06
      const x = cx - rx
      const y = cy - rx
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + s - r, y)
      ctx.quadraticCurveTo(x + s, y, x + s, y + r)
      ctx.lineTo(x + s, y + s - r)
      ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s)
      ctx.lineTo(x + r, y + s)
      ctx.quadraticCurveTo(x, y + s, x, y + s - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }
    ctx.stroke()
  }

  drawOneBorder()

  if (borderStyle === 'double') {
    ctx.setLineDash([])
    const inset = borderWidth * 2.2
    ctx.lineWidth = Math.max(1, borderWidth * 0.7)
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(cx, cy, rx - inset, 0, Math.PI * 2)
      ctx.stroke()
    } else if (shape === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx - inset, ry - inset, 0, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      const inset2 = inset
      const s = (rx - inset2) * 2
      const r = s * 0.06
      const x = cx - rx + inset2
      const y = cy - rx + inset2
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + s - r, y)
      ctx.quadraticCurveTo(x + s, y, x + s, y + r)
      ctx.lineTo(x + s, y + s - r)
      ctx.quadraticCurveTo(x + s, y + s, x + s - r, y + s)
      ctx.lineTo(x + r, y + s)
      ctx.quadraticCurveTo(x, y + s, x, y + s - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.restore()
}

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  fontSize: number,
  fontFamily: string,
  color: string,
  isTop: boolean = true
) {
  if (!text) return

  const rand = seededRandom(text.length * 997 + radius)
  const rgb = hexToRgb(color)

  ctx.save()
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const angleRange = endAngle - startAngle
  const charCount = text.length
  const step = angleRange / Math.max(1, charCount)

  for (let i = 0; i < charCount; i++) {
    const ch = text[i]
    const angle = startAngle + step * (i + 0.5)
    const r = radius + (rand() - 0.5) * 1.5
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    const rot = angle + (isTop ? Math.PI / 2 : -Math.PI / 2)
    const alpha = 0.82 + rand() * 0.18
    const colorVar = 0.92 + rand() * 0.16

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.fillStyle = `rgba(${Math.min(255, Math.floor(rgb.r * colorVar))},${Math.min(255, Math.floor(rgb.g * colorVar))},${Math.min(255, Math.floor(rgb.b * colorVar))},${alpha})`
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

function drawCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  fontSize: number,
  fontFamily: string,
  color: string,
  maxWidth: number
) {
  if (!text) return

  const rand = seededRandom(text.length * 131 + fontSize)
  const rgb = hexToRgb(color)

  ctx.save()
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lines: string[] = []
  const chars = text.split('')
  let currentLine = ''
  let currentWidth = 0

  for (const ch of chars) {
    const w = ctx.measureText(ch).width
    if (currentWidth + w > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = ch
      currentWidth = w
    } else {
      currentLine += ch
      currentWidth += w
    }
  }
  if (currentLine) lines.push(currentLine)

  const totalH = lines.length * fontSize * 1.2
  let startY = cy - totalH / 2 + fontSize * 0.6

  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      const cw = ctx.measureText(ch).width
      const offsetX = (i - (line.length - 1) / 2) * cw * 1.05
      const jitterX = (rand() - 0.5) * 1.2
      const jitterY = (rand() - 0.5) * 1.2
      const alpha = 0.8 + rand() * 0.2
      const colorVar = 0.9 + rand() * 0.2

      ctx.fillStyle = `rgba(${Math.min(255, Math.floor(rgb.r * colorVar))},${Math.min(255, Math.floor(rgb.g * colorVar))},${Math.min(255, Math.floor(rgb.b * colorVar))},${alpha})`
      ctx.fillText(ch, cx + offsetX + jitterX, startY + jitterY)
    }
    startY += fontSize * 1.2
  }

  ctx.restore()
}

function drawStampNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const rand = seededRandom(w * 17 + h * 31)
  const rgb = hexToRgb(color)
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      const a = data[idx + 3]
      if (a > 0) {
        const r = rand()
        if (r < 0.06) {
          data[idx + 3] = Math.max(0, a - 80 - Math.floor(rand() * 120))
        } else if (r < 0.12) {
          data[idx] = Math.min(255, data[idx] + Math.floor(rand() * 40))
          data[idx + 1] = Math.min(255, data[idx + 1] + Math.floor(rand() * 40))
          data[idx + 2] = Math.min(255, data[idx + 2] + Math.floor(rand() * 40))
        } else if (r < 0.18) {
          data[idx] = Math.floor(rgb.r * (0.85 + rand() * 0.3))
          data[idx + 1] = Math.floor(rgb.g * (0.85 + rand() * 0.3))
          data[idx + 2] = Math.floor(rgb.b * (0.85 + rand() * 0.3))
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export interface RenderStampOptions {
  config: StampConfig
  canvas?: HTMLCanvasElement
}

export function renderStampToCanvas({ config, canvas }: RenderStampOptions): {
  canvas: HTMLCanvasElement
  dataUrl: string
  width: number
  height: number
} {
  const DPR = 2
  const size = config.size
  let width: number
  let height: number

  if (config.shape === 'ellipse') {
    width = Math.round(size * 1.4)
    height = Math.round(size)
  } else {
    width = size
    height = size
  }

  const outCanvas = canvas || document.createElement('canvas')
  outCanvas.width = width * DPR
  outCanvas.height = height * DPR
  outCanvas.style.width = `${width}px`
  outCanvas.style.height = `${height}px`

  const ctx = outCanvas.getContext('2d')
  if (!ctx) {
    return { canvas: outCanvas, dataUrl: outCanvas.toDataURL('image/png'), width, height }
  }

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  ctx.clearRect(0, 0, width, height)

  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((config.rotation * Math.PI) / 180)

  const cx = 0
  const cy = 0
  const padding = config.innerPadding + config.borderWidth * 2
  let rx: number
  let ry: number

  if (config.shape === 'circle') {
    rx = (width - padding * 2) / 2
    ry = rx
  } else if (config.shape === 'ellipse') {
    rx = (width - padding * 2) / 2
    ry = (height - padding * 2) / 2
  } else {
    rx = (width - padding * 2) / 2
    ry = rx
  }

  drawBorder(ctx, config.shape, cx, cy, rx, ry, config.borderWidth, config.borderStyle, config.color)

  const textRadius = (config.shape === 'ellipse' ? (rx + ry) / 2 : rx) - config.borderWidth * 2 - 5
  const topFontSize = config.fontSize
  const centerFontSize = config.shape === 'ellipse'
    ? Math.max(10, config.fontSize * 0.85)
    : Math.max(10, config.fontSize * 0.95)
  const bottomFontSize = Math.max(10, config.fontSize * 0.75)

  if (config.topText) {
    const topStart = Math.PI + (Math.PI * 0.85) / 2
    const topEnd = Math.PI * 2 - (Math.PI * 0.85) / 2
    drawArcText(ctx, config.topText, cx, cy, textRadius - topFontSize * 0.2, topStart, topEnd, topFontSize, config.fontFamily, config.color, true)
  }

  if (config.bottomText) {
    const bottomStart = Math.PI + (Math.PI * 0.75) / 2
    const bottomEnd = Math.PI * 2 - (Math.PI * 0.75) / 2
    const bottomTextRadius = textRadius - bottomFontSize * 0.3
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, -1)
    ctx.translate(-cx, -cy)
    drawArcText(ctx, config.bottomText, cx, cy, bottomTextRadius, bottomStart, bottomEnd, bottomFontSize, config.fontFamily, config.color, false)
    ctx.restore()
  }

  const centerAreaSize = (config.shape === 'ellipse' ? ry : rx) * 0.7
  if (config.showStar) {
    const starR = config.starSize
    const starInnerR = starR * 0.4
    const starOffsetY = config.centerText ? -centerAreaSize * 0.55 : 0
    drawStar(ctx, cx, cy + starOffsetY, starR, starInnerR, config.color)
    if (config.centerText) {
      const textAreaY = cy + centerAreaSize * 0.35
      drawCenterText(ctx, config.centerText, cx, textAreaY, centerFontSize, config.fontFamily, config.color, centerAreaSize * 1.6)
    }
  } else if (config.centerText) {
    drawCenterText(ctx, config.centerText, cx, cy, centerFontSize, config.fontFamily, config.color, centerAreaSize * 1.6)
  }

  ctx.restore()

  drawStampNoise(ctx, width, height, config.color)

  const dataUrl = outCanvas.toDataURL('image/png')
  return { canvas: outCanvas, dataUrl, width, height }
}

interface DrawStampOnCanvasOptions {
  ctx: CanvasRenderingContext2D
  stamp: Stamp
  img: HTMLImageElement
  x: number
  y: number
  w: number
  h: number
}

export function drawStampOnCanvas({
  ctx,
  stamp,
  img,
  x,
  y,
  w,
  h,
}: DrawStampOnCanvasOptions) {
  ctx.save()
  ctx.globalAlpha = 0.92
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}

interface DrawStampsForPageOptions {
  ctx: CanvasRenderingContext2D
  pageIdx: number
  stamps: Stamp[]
  stampPlacements: StampPlacement[]
  stampImages: Record<string, HTMLImageElement>
}

export function drawStampsForPage({
  ctx,
  pageIdx,
  stamps,
  stampPlacements,
  stampImages,
}: DrawStampsForPageOptions) {
  const placements = stampPlacements.filter((p) => p.pageIndex === pageIdx)
  placements.forEach((placement) => {
    const stamp = stamps.find((s) => s.id === placement.stampId)
    const img = stampImages[placement.stampId]
    if (!stamp || !img) return

    const w = stamp.width * placement.scale
    const h = stamp.height * placement.scale
    const x = placement.x - w / 2
    const y = placement.y - h / 2

    drawStampOnCanvas({ ctx, stamp, img, x, y, w, h })
  })
}

export async function loadStampImages(
  stamps: Stamp[]
): Promise<Record<string, HTMLImageElement>> {
  const images: Record<string, HTMLImageElement> = {}
  for (const stamp of stamps) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = stamp.dataUrl
      })
      images[stamp.id] = img
    } catch {
      // skip failed images
    }
  }
  return images
}
