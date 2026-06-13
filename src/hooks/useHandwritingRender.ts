import { useRef, useEffect, useCallback, useMemo } from 'react'
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
    const lineDriftY = (lineRand() - 0.5) * 2.5 * jitter * fontSize * 0.3
    const lineTilt = (lineRand() - 0.5) * 0.01 * jitter

    const charRands: (() => number)[] = []
    for (let i = 0; i < line.text.length + 2; i++) {
      charRands.push(seededRandom(baseSeed + li * 9973 + i * 137))
    }

    let totalWidth = 0
    const charWidths: number[] = []
    for (let ci = 0; ci < line.text.length; ci++) {
      const ch = line.text[ci]
      const sizeVar = fontSize * (1 + (charRands[ci]() - 0.5) * 0.12 * Math.max(0.3, jitter))
      const weightVal = 400 + Math.floor((charRands[ci + 1]() - 0.5) * 300 * Math.max(0.3, jitter))
      ctx.font = `${weightVal} ${sizeVar.toFixed(1)}px ${fontFamily}`
      const cw = ctx.measureText(ch).width
      charWidths.push(cw)
      totalWidth += cw
    }
    totalWidth += Math.max(0, letterSpacing) * (line.text.length - 1)

    const maxContentW = pageWidth - marginLeft - marginRight
    const squeeze = totalWidth > maxContentW ? maxContentW / totalWidth : 1

    let x = marginLeft

    for (let ci = 0; ci < line.text.length; ci++) {
      const ch = line.text[ci]
      const r1 = charRands[ci]()
      const r2 = charRands[ci + 1]()
      const r3 = charRands[(ci + 2) % charRands.length]()

      const sizeVar = fontSize * (1 + (r1 - 0.5) * 0.14 * Math.max(0.3, jitter))
      const weightVal = 400 + Math.floor((r2 - 0.5) * 320 * Math.max(0.3, jitter))
      ctx.font = `${weightVal} ${sizeVar.toFixed(1)}px ${fontFamily}`

      const cw = charWidths[ci] * squeeze
      const spacing = ci < line.text.length - 1 ? letterSpacing : 0
      const spacingJitter = (r3 - 0.5) * 2.0 * jitter

      const dx = (r1 - 0.5) * 3.0 * jitter * fontSize * 0.22
      const dy = lineDriftY + (r2 - 0.5) * 2.6 * jitter * fontSize * 0.25
      const rot = lineTilt + (r3 - 0.5) * 0.1 * Math.max(0.25, jitter)

      const alphaBase = 0.72 + r1 * 0.28
      const inkVar = 1 + (r2 - 0.5) * 0.15
      const r = Math.min(255, Math.max(0, Math.floor(ink.r * inkVar)))
      const g = Math.min(255, Math.max(0, Math.floor(ink.g * inkVar)))
      const b = Math.min(255, Math.max(0, Math.floor(ink.b * inkVar)))
      const color = `rgba(${r},${g},${b},${alphaBase})`

      const cx = x + dx + cw / 2
      const cy = y + dy

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rot)

      ctx.fillStyle = color
      ctx.fillText(ch, -cw / 2, 0)

      if (jitter > 0.25 && r3 > 0.6) {
        const haloAlpha = 0.08 + r1 * 0.12
        ctx.globalAlpha = haloAlpha
        ctx.fillStyle = `rgba(${r},${g},${b},1)`
        ctx.fillText(ch, -cw / 2 + (r2 - 0.5) * 0.8, (r3 - 0.5) * 0.6)
        ctx.globalAlpha = 1
      }

      if (jitter > 0.4 && r1 > 0.75) {
        const dryAlpha = 0.3 + r2 * 0.35
        ctx.globalAlpha = dryAlpha
        ctx.fillStyle = `rgba(${r},${g},${b},1)`
        ctx.font = `${Math.max(100, weightVal - 150)} ${(sizeVar * 0.9).toFixed(1)}px ${fontFamily}`
        ctx.fillText(ch, -cw / 2 + (r3 - 0.5) * 1.2, (r1 - 0.5) * 0.8)
        ctx.globalAlpha = 1
      }

      ctx.restore()

      x += cw + spacing + spacingJitter
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
  }, [rawText, renderState, computePages])

  const renderAllCanvases = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const pages = computePages(rawText || ' ', renderState)
    const canvases: HTMLCanvasElement[] = []
    for (let i = 0; i < pages.length; i++) {
      const c = document.createElement('canvas')
      c.width = PAGE_WIDTH * DPR
      c.height = PAGE_HEIGHT * DPR
      const ctx = c.getContext('2d')
      if (!ctx) continue
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      drawPaper(ctx, renderState)
      drawHandwrittenPage(ctx, pages[i] || [], renderState, i)
      canvases.push(c)
    }
    return canvases
  }, [rawText, renderState, computePages])

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
