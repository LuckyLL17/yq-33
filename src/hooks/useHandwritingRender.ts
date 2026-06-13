import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { fontPresets, paperPresets } from '@/constants/presets'
import type { PaperType } from '@/types'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const DPR = 2

export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildFontFamily(selectedFontId: string): string {
  const preset = fontPresets.find((f) => f.id === selectedFontId)
  return preset?.fontFamily || '"Ma Shan Zheng", "KaiTi", cursive, serif'
}

interface RenderState {
  fontFamily: string
  fontSize: number
  inkColor: string
  jitter: number
  letterSpacing: number
  lineHeight: number
  paragraphSpacing: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  pageWidth: number
  pageHeight: number
  paperBgColor: string
  paperLineColor: string
  paperLineSpacing: number
  paperType: PaperType
  showMargin: boolean
}

function drawPaper(ctx: CanvasRenderingContext2D, rs: RenderState) {
  const { pageWidth, pageHeight, paperType, paperBgColor, paperLineColor, paperLineSpacing, showMargin, marginTop, marginBottom, marginLeft, marginRight } = rs

  if (paperType === 'kraft') {
    const gradient = ctx.createLinearGradient(0, 0, pageWidth, pageHeight)
    gradient.addColorStop(0, '#d8bf96')
    gradient.addColorStop(0.5, paperBgColor)
    gradient.addColorStop(1, '#b8986a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, pageWidth, pageHeight)
  } else {
    ctx.fillStyle = paperBgColor
    ctx.fillRect(0, 0, pageWidth, pageHeight)
  }

  ctx.save()
  switch (paperType) {
    case 'line': {
      ctx.strokeStyle = paperLineColor
      ctx.lineWidth = 0.6
      for (let y = marginTop; y <= pageHeight - marginBottom; y += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(marginLeft, y)
        ctx.lineTo(pageWidth - marginRight, y)
        ctx.stroke()
      }
      break
    }
    case 'grid': {
      ctx.strokeStyle = paperLineColor
      ctx.lineWidth = 0.5
      for (let y = marginTop; y <= pageHeight - marginBottom; y += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(marginLeft, y)
        ctx.lineTo(pageWidth - marginRight, y)
        ctx.stroke()
      }
      for (let x = marginLeft; x <= pageWidth - marginRight; x += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, marginTop)
        ctx.lineTo(x, pageHeight - marginBottom)
        ctx.stroke()
      }
      break
    }
    case 'dotted': {
      ctx.fillStyle = paperLineColor
      const r = 0.8
      for (let y = marginTop; y <= pageHeight - marginBottom; y += paperLineSpacing) {
        for (let x = marginLeft; x <= pageWidth - marginRight; x += paperLineSpacing) {
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    }
    default:
      break
  }
  ctx.restore()

  if (showMargin) {
    ctx.save()
    ctx.strokeStyle = '#e06b6b'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    const mx = marginLeft - 14
    ctx.moveTo(mx, marginTop * 0.5)
    ctx.lineTo(mx, pageHeight - marginBottom * 0.5)
    ctx.stroke()

    const holeR = 5
    const holeX = mx - 16
    const holes = [pageHeight * 0.2, pageHeight * 0.5, pageHeight * 0.8]
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.strokeStyle = 'rgba(61,41,20,0.25)'
    ctx.lineWidth = 1
    holes.forEach((hy) => {
      ctx.beginPath()
      ctx.arc(holeX, hy, holeR, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
    ctx.restore()
  }

  ctx.save()
  const noise = ctx.createLinearGradient(0, 0, pageWidth, pageHeight)
  noise.addColorStop(0, 'rgba(61,41,20,0.025)')
  noise.addColorStop(1, 'rgba(61,41,20,0.04)')
  ctx.fillStyle = noise
  ctx.fillRect(0, 0, pageWidth, pageHeight)
  ctx.restore()
}

function breakTextIntoLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  letterSpacing: number
): { text: string; isParagraphEnd: boolean }[] {
  const off = document.createElement('canvas')
  const octx = off.getContext('2d')
  if (!octx) return []
  octx.font = `400 ${fontSize}px ${fontFamily}`

  const paragraphs = text.replace(/\r\n|\r/g, '\n').split('\n')
  const lines: { text: string; isParagraphEnd: boolean }[] = []

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p]
    if (para.length === 0) {
      lines.push({ text: '', isParagraphEnd: true })
      continue
    }

    let cur = ''
    let curW = 0

    for (let i = 0; i < para.length; i++) {
      const ch = para[i]
      const cw = octx.measureText(ch).width + (ch === ' ' ? 0 : letterSpacing)
      if (curW + cw > maxWidth && cur.length > 0) {
        lines.push({ text: cur, isParagraphEnd: false })
        cur = ch
        curW = cw
      } else {
        cur += ch
        curW += cw
      }
    }
    if (cur.length > 0) {
      lines.push({ text: cur, isParagraphEnd: true })
    }
  }

  return lines
}

function paginate(
  lines: { text: string; isParagraphEnd: boolean }[],
  availableH: number,
  lineH: number,
  paragraphGap: number
): { text: string; isParagraphEnd: boolean }[][] {
  const pages: { text: string; isParagraphEnd: boolean }[][] = []
  let cur: { text: string; isParagraphEnd: boolean }[] = []
  let used = 0
  for (const ln of lines) {
    const h = ln.isParagraphEnd ? lineH + paragraphGap : lineH
    if (used + h > availableH && cur.length > 0) {
      pages.push(cur)
      cur = []
      used = 0
    }
    cur.push(ln)
    used += h
  }
  if (cur.length > 0) pages.push(cur)
  if (pages.length === 0) pages.push([])
  return pages
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

interface CharDrawInfo {
  ch: string
  sizeVar: number
  cw: number
  dx: number
  dy: number
  rot: number
  alpha: number
  inkR: number
  inkG: number
  inkB: number
  spacingJitter: number
  haloDx: number
  haloDy: number
  drySize: number
}

function drawHandwrittenPage(
  ctx: CanvasRenderingContext2D,
  pageLines: { text: string; isParagraphEnd: boolean }[],
  rs: RenderState,
  pageIndex: number
) {
  const {
    fontFamily,
    fontSize,
    inkColor,
    jitter,
    letterSpacing,
    lineHeight,
    paragraphSpacing,
    marginTop,
    marginLeft,
    pageWidth,
    marginRight,
  } = rs

  const linePx = fontSize * lineHeight
  const ink = hexToRgb(inkColor)
  const j = Math.max(0.3, jitter)

  ctx.save()
  ctx.textBaseline = 'alphabetic'

  let y = marginTop + fontSize
  const baseSeed = pageIndex * 100001 + 17

  for (let li = 0; li < pageLines.length; li++) {
    const line = pageLines[li]
    if (line.text.length === 0) {
      y += linePx + (line.isParagraphEnd ? paragraphSpacing : 0)
      continue
    }

    const lineRand = seededRandom(baseSeed + li * 9973)
    const lineDriftY = (lineRand() - 0.5) * 2.0 * j * fontSize * 0.25
    const lineTilt = (lineRand() - 0.5) * 0.008 * j

    const chars: CharDrawInfo[] = []
    let totalW = 0

    for (let ci = 0; ci < line.text.length; ci++) {
      const rand = seededRandom(baseSeed + li * 9973 + ci * 137)
      const r1 = rand()
      const r2 = rand()
      const r3 = rand()
      const r4 = rand()
      const r5 = rand()
      const r6 = rand()
      const r7 = rand()

      const sizeVar = fontSize * (1 + (r1 - 0.5) * 0.1 * j)

      ctx.font = `400 ${sizeVar.toFixed(1)}px ${fontFamily}`
      const cw = ctx.measureText(line.text[ci]).width

      const dx = (r2 - 0.5) * 2.5 * j * fontSize * 0.18
      const dy = lineDriftY + (r3 - 0.5) * 2.0 * j * fontSize * 0.2
      const rot = lineTilt + (r4 - 0.5) * 0.06 * j

      const alpha = 0.78 + r5 * 0.22
      const inkVar = 1 + (r6 - 0.5) * 0.12
      const inkR = Math.min(255, Math.max(0, Math.floor(ink.r * inkVar)))
      const inkG = Math.min(255, Math.max(0, Math.floor(ink.g * inkVar)))
      const inkB = Math.min(255, Math.max(0, Math.floor(ink.b * inkVar)))

      const spacingJitter = Math.max(-0.5, (r7 - 0.5) * 1.6 * j)

      chars.push({
        ch: line.text[ci],
        sizeVar,
        cw,
        dx,
        dy,
        rot,
        alpha,
        inkR,
        inkG,
        inkB,
        spacingJitter,
        haloDx: (r4 - 0.5) * 0.6,
        haloDy: (r5 - 0.5) * 0.5,
        drySize: sizeVar * (0.88 + r6 * 0.08),
      })

      totalW += cw
    }

    totalW += Math.max(0, letterSpacing) * (line.text.length - 1)
    for (const c of chars) {
      totalW += c.spacingJitter
    }
    const maxContentW = pageWidth - marginLeft - marginRight
    const squeeze = totalW > maxContentW ? maxContentW / totalW : 1

    let x = marginLeft

    for (let ci = 0; ci < chars.length; ci++) {
      const c = chars[ci]
      const cw = c.cw * squeeze
      const spacing = ci < chars.length - 1 ? letterSpacing : 0
      const advance = cw + spacing + c.spacingJitter * squeeze

      const cx = x + c.dx + cw / 2
      const cy = y + c.dy

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(c.rot)

      ctx.font = `400 ${c.sizeVar.toFixed(1)}px ${fontFamily}`
      ctx.fillStyle = `rgba(${c.inkR},${c.inkG},${c.inkB},${c.alpha})`
      ctx.fillText(c.ch, -cw / 2, 0)

      if (jitter > 0.25 && c.rot !== 0 && Math.abs(c.dx) > 0.3) {
        ctx.globalAlpha = 0.07 + c.alpha * 0.08
        ctx.fillText(c.ch, -cw / 2 + c.haloDx, c.haloDy)
        ctx.globalAlpha = 1
      }

      if (jitter > 0.45 && c.alpha < 0.85) {
        ctx.globalAlpha = 0.18 + c.alpha * 0.15
        ctx.font = `400 ${c.drySize.toFixed(1)}px ${fontFamily}`
        ctx.fillText(c.ch, -cw / 2 + c.haloDx * 1.5, c.haloDy * 1.2)
        ctx.globalAlpha = 1
      }

      ctx.restore()

      x += advance
    }

    y += linePx
    if (line.isParagraphEnd && li < pageLines.length - 1) {
      y += paragraphSpacing
    }
  }

  ctx.restore()
}

interface UseHandwritingRenderOptions {
  externalCanvasRef?: React.RefObject<HTMLCanvasElement>
}

export function useHandwritingRender(options: UseHandwritingRenderOptions = {}) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = (options.externalCanvasRef as React.RefObject<HTMLCanvasElement>) || internalRef

  const rawText = useWorkspaceStore((s) => s.rawText)
  const selectedFontId = useWorkspaceStore((s) => s.selectedFontId)
  const fontSize = useWorkspaceStore((s) => s.fontSize)
  const inkColor = useWorkspaceStore((s) => s.inkColor)
  const jitterAmount = useWorkspaceStore((s) => s.jitterAmount)
  const letterSpacing = useWorkspaceStore((s) => s.letterSpacing)
  const lineHeight = useWorkspaceStore((s) => s.lineHeight)
  const paragraphSpacing = useWorkspaceStore((s) => s.paragraphSpacing)
  const marginTop = useWorkspaceStore((s) => s.marginTop)
  const marginRight = useWorkspaceStore((s) => s.marginRight)
  const marginBottom = useWorkspaceStore((s) => s.marginBottom)
  const marginLeft = useWorkspaceStore((s) => s.marginLeft)
  const selectedPaperId = useWorkspaceStore((s) => s.selectedPaperId)
  const paperBgColor = useWorkspaceStore((s) => s.paperBgColor)
  const paperLineColor = useWorkspaceStore((s) => s.paperLineColor)
  const paperLineSpacing = useWorkspaceStore((s) => s.paperLineSpacing)
  const showBindingLine = useWorkspaceStore((s) => s.showBindingLine)
  const currentPage = useWorkspaceStore((s) => s.currentPage)
  const setTotalPages = useWorkspaceStore((s) => s.setTotalPages)

  const renderState: RenderState = useMemo(() => {
    const paper = paperPresets.find((p) => p.id === selectedPaperId) || paperPresets[0]
    const typeMap: Record<string, PaperType> = {
      blank: 'blank', line: 'line', grid: 'grid', squared: 'grid',
      notebook: 'line', kraft: 'kraft', newspaper: 'blank', dotted: 'dotted',
    }
    return {
      fontFamily: buildFontFamily(selectedFontId),
      fontSize,
      inkColor,
      jitter: jitterAmount,
      letterSpacing,
      lineHeight,
      paragraphSpacing,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      paperBgColor: paperBgColor || paper.bgColor,
      paperLineColor: paperLineColor || paper.lineColor,
      paperLineSpacing: paperLineSpacing || paper.lineSpacing,
      paperType: typeMap[selectedPaperId] || 'line',
      showMargin: showBindingLine || paper.hasMargin,
    }
  }, [
    selectedFontId, fontSize, inkColor, jitterAmount, letterSpacing, lineHeight,
    paragraphSpacing, marginTop, marginRight, marginBottom, marginLeft,
    selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing, showBindingLine,
  ])

  const computePages = useCallback((text: string, rs: RenderState) => {
    const maxWidth = rs.pageWidth - rs.marginLeft - rs.marginRight
    const availH = rs.pageHeight - rs.marginTop - rs.marginBottom
    const linePx = rs.fontSize * rs.lineHeight
    const lines = breakTextIntoLines(
      text || ' ',
      maxWidth,
      rs.fontSize,
      rs.fontFamily,
      rs.letterSpacing
    )
    return paginate(lines, availH, linePx, rs.paragraphSpacing)
  }, [])

  const totalPages = useMemo(() => {
    const p = computePages(rawText, renderState)
    return p.length
  }, [rawText, renderState, computePages])

  useEffect(() => {
    setTotalPages(totalPages)
  }, [totalPages, setTotalPages])

  const { signatures, signaturePlacements } = useWorkspaceStore()
  const [signatureImages, setSignatureImages] = useState<Record<string, HTMLImageElement>>({})

  useEffect(() => {
    const loadImages = async () => {
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
      setSignatureImages(images)
    }
    loadImages()
  }, [signatures])

  const drawSignatures = useCallback((ctx: CanvasRenderingContext2D, pageIdx: number) => {
    const placements = signaturePlacements.filter((p) => p.pageIndex === pageIdx)
    placements.forEach((placement) => {
      const sig = signatures.find((s) => s.id === placement.signatureId)
      const img = signatureImages[placement.signatureId]
      if (!sig || !img) return

      const w = sig.width * placement.scale
      const h = sig.height * placement.scale
      const x = placement.x - w / 2
      const y = placement.y - h / 2

      if (sig.bgOpacity && sig.bgOpacity > 0) {
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
          case 'line': {
            ctx.strokeStyle = sig.paperLineColor
            ctx.lineWidth = 0.6 / scaleX
            for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
              ctx.beginPath()
              ctx.moveTo(marginLeft, ly)
              ctx.lineTo(pageWidth - marginRight, ly)
              ctx.stroke()
            }
            break
          }
          case 'grid': {
            ctx.strokeStyle = sig.paperLineColor
            ctx.lineWidth = 0.5 / scaleX
            for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
              ctx.beginPath()
              ctx.moveTo(marginLeft, ly)
              ctx.lineTo(pageWidth - marginRight, ly)
              ctx.stroke()
            }
            for (let lx = marginLeft; lx <= pageWidth - marginRight; lx += sig.paperLineSpacing) {
              ctx.beginPath()
              ctx.moveTo(lx, marginTop)
              ctx.lineTo(lx, pageHeight - marginBottom)
              ctx.stroke()
            }
            break
          }
          case 'dotted': {
            ctx.fillStyle = sig.paperLineColor
            const r = 0.8 / scaleX
            for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
              for (let lx = marginLeft; lx <= pageWidth - marginRight; lx += sig.paperLineSpacing) {
                ctx.beginPath()
                ctx.arc(lx, ly, r, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            break
          }
          default:
            break
        }

        ctx.restore()
        ctx.restore()
      }

      ctx.drawImage(img, x, y, w, h)
    })
  }, [signatures, signaturePlacements, signatureImages])

  const renderToCanvas = useCallback((canvas: HTMLCanvasElement, pageIdx: number) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = PAGE_WIDTH * DPR
    canvas.height = PAGE_HEIGHT * DPR
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

    const pages = computePages(rawText || ' ', renderState)
    const safeIdx = Math.max(0, Math.min(pageIdx, pages.length - 1))

    drawPaper(ctx, renderState)
    drawHandwrittenPage(ctx, pages[safeIdx] || [], renderState, safeIdx)
    drawSignatures(ctx, safeIdx)
  }, [rawText, renderState, computePages, drawSignatures])

  const renderAllCanvases = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const pages = computePages(rawText || ' ', renderState)
    const canvases: HTMLCanvasElement[] = []

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }

    const signatureImages: Record<string, HTMLImageElement> = {}
    for (const sig of signatures) {
      try {
        signatureImages[sig.id] = await loadImage(sig.dataUrl)
      } catch {
        // skip failed images
      }
    }

    for (let i = 0; i < pages.length; i++) {
      const c = document.createElement('canvas')
      c.width = PAGE_WIDTH * DPR
      c.height = PAGE_HEIGHT * DPR
      const ctx = c.getContext('2d')
      if (!ctx) continue
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      drawPaper(ctx, renderState)
      drawHandwrittenPage(ctx, pages[i] || [], renderState, i)

      const placements = signaturePlacements.filter((p) => p.pageIndex === i)
      placements.forEach((placement) => {
        const sig = signatures.find((s) => s.id === placement.signatureId)
        const img = signatureImages[placement.signatureId]
        if (!sig || !img) return

        const w = sig.width * placement.scale
        const h = sig.height * placement.scale
        const x = placement.x - w / 2
        const y = placement.y - h / 2

        if (sig.bgOpacity && sig.bgOpacity > 0) {
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
            case 'line': {
              ctx.strokeStyle = sig.paperLineColor
              ctx.lineWidth = 0.6 / scaleX
              for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
                ctx.beginPath()
                ctx.moveTo(marginLeft, ly)
                ctx.lineTo(pageWidth - marginRight, ly)
                ctx.stroke()
              }
              break
            }
            case 'grid': {
              ctx.strokeStyle = sig.paperLineColor
              ctx.lineWidth = 0.5 / scaleX
              for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
                ctx.beginPath()
                ctx.moveTo(marginLeft, ly)
                ctx.lineTo(pageWidth - marginRight, ly)
                ctx.stroke()
              }
              for (let lx = marginLeft; lx <= pageWidth - marginRight; lx += sig.paperLineSpacing) {
                ctx.beginPath()
                ctx.moveTo(lx, marginTop)
                ctx.lineTo(lx, pageHeight - marginBottom)
                ctx.stroke()
              }
              break
            }
            case 'dotted': {
              ctx.fillStyle = sig.paperLineColor
              const r = 0.8 / scaleX
              for (let ly = marginTop; ly <= pageHeight - marginBottom; ly += sig.paperLineSpacing) {
                for (let lx = marginLeft; lx <= pageWidth - marginRight; lx += sig.paperLineSpacing) {
                  ctx.beginPath()
                  ctx.arc(lx, ly, r, 0, Math.PI * 2)
                  ctx.fill()
                }
              }
              break
            }
            default:
              break
          }

          ctx.restore()
          ctx.restore()
        }

        ctx.drawImage(img, x, y, w, h)
      })

      canvases.push(c)
    }
    return canvases
  }, [rawText, renderState, computePages, signatures, signaturePlacements])

  useEffect(() => {
    if (!canvasRef.current) return
    renderToCanvas(canvasRef.current, Math.max(0, currentPage - 1))
  }, [canvasRef, renderToCanvas, currentPage])

  return {
    canvasRef,
    totalPages,
    pageSize: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
    renderToCanvas,
    renderAllCanvases,
  }
}
