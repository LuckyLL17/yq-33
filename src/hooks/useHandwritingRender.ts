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

interface PageInfo {
  totalPages: number
}

function buildFontFamily(selectedFontId: string): string {
  const preset = fontPresets.find((f) => f.id === selectedFontId)
  return preset?.fontFamily || '"KaiTi", "STKaiti", "楷体", "Ma Shan Zheng", cursive, serif'
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

function readRenderState(s: ReturnType<typeof useWorkspaceStore.getState>): RenderState {
  const paper = paperPresets.find((p) => p.id === s.selectedPaperId) || paperPresets[0]
  const typeMap: Record<string, PaperType> = {
    blank: 'blank',
    line: 'line',
    grid: 'grid',
    squared: 'grid',
    notebook: 'line',
    kraft: 'kraft',
    newspaper: 'blank',
    dotted: 'dotted',
  }
  return {
    fontFamily: buildFontFamily(s.selectedFontId),
    fontSize: s.fontSize,
    inkColor: s.inkColor,
    jitter: s.jitterAmount,
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    paragraphSpacing: s.paragraphSpacing,
    marginTop: s.marginTop,
    marginRight: s.marginRight,
    marginBottom: s.marginBottom,
    marginLeft: s.marginLeft,
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    paperBgColor: s.paperBgColor || paper.bgColor,
    paperLineColor: s.paperLineColor || paper.lineColor,
    paperLineSpacing: s.paperLineSpacing || paper.lineSpacing,
    paperType: typeMap[s.selectedPaperId] || 'line',
    showMargin: s.showBindingLine || paper.hasMargin,
  }
}

function drawPaper(ctx: CanvasRenderingContext2D, rs: RenderState) {
  const { pageWidth, pageHeight, paperType, paperBgColor, paperLineColor, paperLineSpacing, showMargin } = rs

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
      for (let y = rs.marginTop; y <= pageHeight - rs.marginBottom; y += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(rs.marginLeft, y)
        ctx.lineTo(pageWidth - rs.marginRight, y)
        ctx.stroke()
      }
      break
    }
    case 'grid': {
      ctx.strokeStyle = paperLineColor
      ctx.lineWidth = 0.5
      for (let y = rs.marginTop; y <= pageHeight - rs.marginBottom; y += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(rs.marginLeft, y)
        ctx.lineTo(pageWidth - rs.marginRight, y)
        ctx.stroke()
      }
      for (let x = rs.marginLeft; x <= pageWidth - rs.marginRight; x += paperLineSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, rs.marginTop)
        ctx.lineTo(x, pageHeight - rs.marginBottom)
        ctx.stroke()
      }
      break
    }
    case 'dotted': {
      ctx.fillStyle = paperLineColor
      const r = 0.8
      for (let y = rs.marginTop; y <= pageHeight - rs.marginBottom; y += paperLineSpacing) {
        for (let x = rs.marginLeft; x <= pageWidth - rs.marginRight; x += paperLineSpacing) {
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
    const mx = rs.marginLeft - 14
    ctx.moveTo(mx, rs.marginTop * 0.5)
    ctx.lineTo(mx, pageHeight - rs.marginBottom * 0.5)
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

interface LineChunk {
  chars: string[]
  widths: number[]
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
  } = rs

  const linePx = fontSize * lineHeight
  ctx.save()
  ctx.fillStyle = inkColor
  ctx.textBaseline = 'alphabetic'

  let y = marginTop + fontSize
  const baseSeed = pageIndex * 100001 + 17

  for (let li = 0; li < pageLines.length; li++) {
    const line = pageLines[li]
    let x = marginLeft
    const rand = seededRandom(baseSeed + li * 9973)

    for (let ci = 0; ci < line.text.length; ci++) {
      const ch = line.text[ci]
      if (ch === ' ') {
        ctx.font = `400 ${fontSize}px ${fontFamily}`
        x += ctx.measureText(' ').width
        continue
      }

      const weightVariation = 400 + Math.floor((rand() - 0.5) * 200 * Math.max(0.2, jitter))
      const sizeVariation = fontSize + (rand() - 0.5) * 1.6 * Math.max(0.2, jitter)
      ctx.font = `${weightVariation} ${sizeVariation.toFixed(1)}px ${fontFamily}`

      const dx = (rand() - 0.5) * 2.2 * Math.max(0.3, jitter) * fontSize * 0.25
      const dy = (rand() - 0.5) * 2.0 * Math.max(0.3, jitter) * fontSize * 0.25
      const rot = (rand() - 0.5) * 0.08 * Math.max(0.25, jitter)

      const cw = ctx.measureText(ch).width

      ctx.save()
      ctx.translate(x + dx + cw / 2, y + dy)
      ctx.rotate(rot)

      if (jitter > 0.15) {
        ctx.globalAlpha = 0.55 + rand() * 0.4
      }

      ctx.fillText(ch, -cw / 2, 0)

      if (jitter > 0.3 && rand() > 0.6) {
        ctx.globalAlpha = 0.12 + rand() * 0.15
        ctx.fillText(ch, -cw / 2 + (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.4)
      }

      ctx.restore()

      x += cw + letterSpacing
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
