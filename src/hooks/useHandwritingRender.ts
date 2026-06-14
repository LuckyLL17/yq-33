import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { paperPresets } from '@/constants/presets'
import { builtInFonts, buildFontStack, getFontById } from '@/utils/fontPresets'
import { loadFont } from '@/utils/fontLoader'
import type { PaperType } from '@/types'
import { drawSignaturesForPage, loadSignatureImages } from '@/utils/signatureRenderer'
import { drawStampsForPage, loadStampImages } from '@/utils/stampRenderer'
import { drawAnnotationsForPage } from '@/utils/annotationRenderer'
import { drawDecorationsForPage, loadDecorationImages, type DecorationImageCache } from '@/utils/decorationRenderer'
import { applyFilter } from '@/utils/filterEffects'
import { decorationPresets } from '@/constants/decorationPresets'
import { layoutMarkdown, paginateMarkdownLines, drawMarkdownPage } from '@/utils/markdown'
import type { RenderLine } from '@/utils/markdown'

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

function buildFontFamily(selectedFontId: string, customFonts: any[] = []): string {
  const font = getFontById(selectedFontId, customFonts)
  if (font) {
    return buildFontStack(font)
  }
  return '"Ma Shan Zheng", "KaiTi", cursive, serif'
}

interface JitterParams {
  amount: number
  positionX: number
  positionY: number
  size: number
  rotation: number
  baseline: number
  inkDensity: number
  inkColor: number
  spacing: number
  lineDrift: number
  lineTilt: number
  halo: number
  dryBrush: number
}

interface RenderState {
  fontFamily: string
  fontSize: number
  inkColor: string
  jitter: JitterParams
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
  markdownEnabled: boolean
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
  const jAmount = Math.max(0.01, jitter.amount)

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
    const lineDriftY = (lineRand() - 0.5) * 2.0 * jAmount * jitter.lineDrift * fontSize * 0.3
    const lineTilt = (lineRand() - 0.5) * 0.008 * jAmount * jitter.lineTilt

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
      const r8 = rand()

      const sizeVar = fontSize * (1 + (r1 - 0.5) * 0.12 * jAmount * jitter.size)

      ctx.font = `400 ${sizeVar.toFixed(1)}px ${fontFamily}`
      const cw = ctx.measureText(line.text[ci]).width

      const dx = (r2 - 0.5) * 2.5 * jAmount * jitter.positionX * fontSize * 0.2
      const baselineOffset = (r3 - 0.5) * 2.0 * jAmount * jitter.baseline * fontSize * 0.15
      const dy = lineDriftY + (r8 - 0.5) * 2.0 * jAmount * jitter.positionY * fontSize * 0.15 + baselineOffset
      const rot = lineTilt + (r4 - 0.5) * 0.07 * jAmount * jitter.rotation

      const baseAlpha = 0.82
      const alphaRange = 0.18
      const alpha = baseAlpha + r5 * alphaRange * jitter.inkDensity * jAmount

      const inkVarBase = 1
      const inkVarRange = 0.15
      const inkVar = inkVarBase + (r6 - 0.5) * inkVarRange * jitter.inkColor * jAmount
      const inkR = Math.min(255, Math.max(0, Math.floor(ink.r * inkVar)))
      const inkG = Math.min(255, Math.max(0, Math.floor(ink.g * inkVar)))
      const inkB = Math.min(255, Math.max(0, Math.floor(ink.b * inkVar)))

      const spacingJitter = Math.max(-0.6, (r7 - 0.5) * 1.8 * jAmount * jitter.spacing)

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
        haloDx: (r4 - 0.5) * 0.8 * jitter.halo * jAmount,
        haloDy: (r5 - 0.5) * 0.6 * jitter.halo * jAmount,
        drySize: sizeVar * (0.85 + r6 * 0.1 * jitter.dryBrush * jAmount),
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

      const haloEnabled = jitter.halo > 0.1 && jAmount > 0.1
      if (haloEnabled && (Math.abs(c.rot) > 0.002 || Math.abs(c.dx) > 0.2)) {
        const haloAlpha = (0.06 + c.alpha * 0.07) * jitter.halo * jAmount * 2
        ctx.globalAlpha = Math.min(0.25, Math.max(0.02, haloAlpha))
        ctx.fillText(c.ch, -cw / 2 + c.haloDx, c.haloDy)
        ctx.globalAlpha = 1
      }

      const dryBrushEnabled = jitter.dryBrush > 0.1 && jAmount > 0.15
      if (dryBrushEnabled && c.alpha < 0.88) {
        const dryAlpha = (0.15 + c.alpha * 0.12) * jitter.dryBrush * jAmount * 1.5
        ctx.globalAlpha = Math.min(0.35, Math.max(0.03, dryAlpha))
        ctx.font = `400 ${c.drySize.toFixed(1)}px ${fontFamily}`
        ctx.fillText(c.ch, -cw / 2 + c.haloDx * 1.8, c.haloDy * 1.4)
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
  const customFonts = useWorkspaceStore((s) => s.customFonts)
  const fontSize = useWorkspaceStore((s) => s.fontSize)
  const inkColor = useWorkspaceStore((s) => s.inkColor)
  const jitterAmount = useWorkspaceStore((s) => s.jitterAmount)
  const jitterPositionX = useWorkspaceStore((s) => s.jitterPositionX)
  const jitterPositionY = useWorkspaceStore((s) => s.jitterPositionY)
  const jitterSize = useWorkspaceStore((s) => s.jitterSize)
  const jitterRotation = useWorkspaceStore((s) => s.jitterRotation)
  const jitterBaseline = useWorkspaceStore((s) => s.jitterBaseline)
  const jitterInkDensity = useWorkspaceStore((s) => s.jitterInkDensity)
  const jitterInkColor = useWorkspaceStore((s) => s.jitterInkColor)
  const jitterSpacing = useWorkspaceStore((s) => s.jitterSpacing)
  const jitterLineDrift = useWorkspaceStore((s) => s.jitterLineDrift)
  const jitterLineTilt = useWorkspaceStore((s) => s.jitterLineTilt)
  const jitterHalo = useWorkspaceStore((s) => s.jitterHalo)
  const jitterDryBrush = useWorkspaceStore((s) => s.jitterDryBrush)
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
  const markdownEnabled = useWorkspaceStore((s) => s.markdownEnabled)
  const currentPage = useWorkspaceStore((s) => s.currentPage)
  const setTotalPages = useWorkspaceStore((s) => s.setTotalPages)

  const renderState: RenderState = useMemo(() => {
    const paper = paperPresets.find((p) => p.id === selectedPaperId) || paperPresets[0]
    const typeMap: Record<string, PaperType> = {
      blank: 'blank', line: 'line', grid: 'grid', squared: 'grid',
      notebook: 'line', kraft: 'kraft', newspaper: 'blank', dotted: 'dotted',
    }
    return {
      fontFamily: buildFontFamily(selectedFontId, customFonts),
      fontSize,
      inkColor,
      jitter: {
        amount: jitterAmount,
        positionX: jitterPositionX,
        positionY: jitterPositionY,
        size: jitterSize,
        rotation: jitterRotation,
        baseline: jitterBaseline,
        inkDensity: jitterInkDensity,
        inkColor: jitterInkColor,
        spacing: jitterSpacing,
        lineDrift: jitterLineDrift,
        lineTilt: jitterLineTilt,
        halo: jitterHalo,
        dryBrush: jitterDryBrush,
      },
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
      markdownEnabled,
    }
  }, [
    selectedFontId, customFonts, fontSize, inkColor, jitterAmount,
    jitterPositionX, jitterPositionY, jitterSize, jitterRotation, jitterBaseline,
    jitterInkDensity, jitterInkColor, jitterSpacing, jitterLineDrift, jitterLineTilt,
    jitterHalo, jitterDryBrush,
    letterSpacing, lineHeight, paragraphSpacing, marginTop, marginRight, marginBottom, marginLeft,
    selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing, showBindingLine,
    markdownEnabled,
  ])

  useEffect(() => {
    const font = getFontById(selectedFontId, customFonts)
    if (font) {
      loadFont(font)
    }
  }, [selectedFontId, customFonts])

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

  const computeMarkdownPages = useCallback((text: string, rs: RenderState): RenderLine[][] => {
    const maxWidth = rs.pageWidth - rs.marginLeft - rs.marginRight
    const availH = rs.pageHeight - rs.marginTop - rs.marginBottom

    const off = document.createElement('canvas')
    const octx = off.getContext('2d')

    const { lines } = layoutMarkdown(text || ' ', {
      maxWidth,
      marginTop: rs.marginTop,
      marginBottom: rs.marginBottom,
      marginLeft: 0,
      marginRight: 0,
      defaultFontFamily: rs.fontFamily,
      baseFontSize: rs.fontSize,
      baseInkColor: rs.inkColor,
      jitterAmount: rs.jitter.amount,
      letterSpacing: rs.letterSpacing,
      lineHeight: rs.lineHeight,
      paragraphSpacing: rs.paragraphSpacing,
    }, octx)

    return paginateMarkdownLines(lines, rs.pageHeight, rs.marginTop, rs.marginBottom)
  }, [])

  const totalPages = useMemo(() => {
    if (renderState.markdownEnabled) {
      const p = computeMarkdownPages(rawText, renderState)
      return p.length
    }
    const p = computePages(rawText, renderState)
    return p.length
  }, [rawText, renderState, computePages, computeMarkdownPages])

  useEffect(() => {
    setTotalPages(totalPages)
  }, [totalPages, setTotalPages])

  const {
    signatures,
    signaturePlacements,
    stamps,
    stampPlacements,
    annotations,
    decorationPlacements,
    activeFilter,
    filterIntensity,
  } = useWorkspaceStore()
  const [signatureImages, setSignatureImages] = useState<Record<string, HTMLImageElement>>({})
  const [stampImages, setStampImages] = useState<Record<string, HTMLImageElement>>({})
  const [decorationImages, setDecorationImages] = useState<DecorationImageCache>({})

  useEffect(() => {
    loadSignatureImages(signatures).then(setSignatureImages)
  }, [signatures])

  useEffect(() => {
    loadStampImages(stamps).then(setStampImages)
  }, [stamps])

  useEffect(() => {
    loadDecorationImages(decorationPresets).then(setDecorationImages)
  }, [])

  const drawSignatures = useCallback((ctx: CanvasRenderingContext2D, pageIdx: number) => {
    drawSignaturesForPage({
      ctx,
      pageIdx,
      signatures,
      signaturePlacements,
      signatureImages,
    })
  }, [signatures, signaturePlacements, signatureImages])

  const drawStamps = useCallback((ctx: CanvasRenderingContext2D, pageIdx: number) => {
    drawStampsForPage({
      ctx,
      pageIdx,
      stamps,
      stampPlacements,
      stampImages,
    })
  }, [stamps, stampPlacements, stampImages])

  const drawAnnotations = useCallback((ctx: CanvasRenderingContext2D, pageIdx: number) => {
    drawAnnotationsForPage({
      ctx,
      pageIdx,
      annotations,
    })
  }, [annotations])

  const drawDecorations = useCallback((ctx: CanvasRenderingContext2D, pageIdx: number) => {
    drawDecorationsForPage({
      ctx,
      pageIdx,
      decorationPlacements,
      decorationImages,
    })
  }, [decorationPlacements, decorationImages])

  const renderToCanvas = useCallback((canvas: HTMLCanvasElement, pageIdx: number) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = PAGE_WIDTH * DPR
    canvas.height = PAGE_HEIGHT * DPR
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

    drawPaper(ctx, renderState)

    if (renderState.markdownEnabled) {
      const pages = computeMarkdownPages(rawText || ' ', renderState)
      const safeIdx = Math.max(0, Math.min(pageIdx, pages.length - 1))
      drawMarkdownPage(ctx, pages[safeIdx] || [], safeIdx, {
        maxWidth: PAGE_WIDTH - renderState.marginLeft - renderState.marginRight,
        marginTop: renderState.marginTop,
        marginBottom: renderState.marginBottom,
        marginLeft: renderState.marginLeft,
        marginRight: renderState.marginRight,
        defaultFontFamily: renderState.fontFamily,
        baseFontSize: renderState.fontSize,
        baseInkColor: renderState.inkColor,
        jitterAmount: renderState.jitter.amount,
        letterSpacing: renderState.letterSpacing,
        lineHeight: renderState.lineHeight,
        paragraphSpacing: renderState.paragraphSpacing,
      })
    } else {
      const pages = computePages(rawText || ' ', renderState)
      const safeIdx = Math.max(0, Math.min(pageIdx, pages.length - 1))
      drawHandwrittenPage(ctx, pages[safeIdx] || [], renderState, safeIdx)
    }

    if (activeFilter !== 'none') {
      applyFilter(ctx, activeFilter, filterIntensity, inkColor)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    const currentPageIdx = renderState.markdownEnabled 
      ? Math.max(0, Math.min(pageIdx, computeMarkdownPages(rawText || ' ', renderState).length - 1))
      : Math.max(0, Math.min(pageIdx, computePages(rawText || ' ', renderState).length - 1))

    drawSignatures(ctx, currentPageIdx)
    drawStamps(ctx, currentPageIdx)
    drawAnnotations(ctx, currentPageIdx)
    drawDecorations(ctx, currentPageIdx)
  }, [rawText, renderState, computePages, computeMarkdownPages, drawSignatures, drawStamps, drawAnnotations, drawDecorations, activeFilter, filterIntensity, inkColor])

  const renderAllCanvases = useCallback(async (): Promise<HTMLCanvasElement[]> => {
    const pages = renderState.markdownEnabled 
      ? computeMarkdownPages(rawText || ' ', renderState)
      : computePages(rawText || ' ', renderState)
    const canvases: HTMLCanvasElement[] = []
    const sigImages = await loadSignatureImages(signatures)
    const sImages = await loadStampImages(stamps)
    const dImages = await loadDecorationImages(decorationPresets)

    for (let i = 0; i < pages.length; i++) {
      const c = document.createElement('canvas')
      c.width = PAGE_WIDTH * DPR
      c.height = PAGE_HEIGHT * DPR
      const ctx = c.getContext('2d')
      if (!ctx) continue
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      drawPaper(ctx, renderState)
      
      if (renderState.markdownEnabled) {
        drawMarkdownPage(ctx, pages[i] as RenderLine[] || [], i, {
          maxWidth: PAGE_WIDTH - renderState.marginLeft - renderState.marginRight,
          marginTop: renderState.marginTop,
          marginBottom: renderState.marginBottom,
          marginLeft: renderState.marginLeft,
          marginRight: renderState.marginRight,
          defaultFontFamily: renderState.fontFamily,
          baseFontSize: renderState.fontSize,
          baseInkColor: renderState.inkColor,
          jitterAmount: renderState.jitter.amount,
          letterSpacing: renderState.letterSpacing,
          lineHeight: renderState.lineHeight,
          paragraphSpacing: renderState.paragraphSpacing,
        })
      } else {
        drawHandwrittenPage(ctx, pages[i] as any || [], renderState, i)
      }

      if (activeFilter !== 'none') {
        applyFilter(ctx, activeFilter, filterIntensity, inkColor)
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      }

      drawSignaturesForPage({
        ctx,
        pageIdx: i,
        signatures,
        signaturePlacements,
        signatureImages: sigImages,
      })

      drawStampsForPage({
        ctx,
        pageIdx: i,
        stamps,
        stampPlacements,
        stampImages: sImages,
      })

      drawAnnotationsForPage({
        ctx,
        pageIdx: i,
        annotations,
      })

      drawDecorationsForPage({
        ctx,
        pageIdx: i,
        decorationPlacements,
        decorationImages: dImages,
      })

      canvases.push(c)
    }
    return canvases
  }, [rawText, renderState, computePages, computeMarkdownPages, signatures, signaturePlacements, stamps, stampPlacements, annotations, decorationPlacements, activeFilter, filterIntensity, inkColor])

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
