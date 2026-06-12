import { useRef, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { fontPresets, paperPresets } from '@/constants/presets'

interface RenderDimensions {
  pageWidth: number
  pageHeight: number
  contentWidth: number
  contentHeight: number
}

interface UseHandwritingRenderOptions {
  externalCanvasRef?: React.RefObject<HTMLCanvasElement>
}

interface UseHandwritingRenderReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>
  render: () => void
  getPageCount: () => number
  getDimensions: () => RenderDimensions
}

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function useHandwritingRender(options: UseHandwritingRenderOptions = {}): UseHandwritingRenderReturn {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = options.externalCanvasRef || internalCanvasRef
  const state = useWorkspaceStore()

  const getFontFamily = useCallback((): string => {
    const preset = fontPresets.find((f) => f.id === state.selectedFontId)
    return preset?.fontFamily || '"KaiTi", "STKaiti", serif'
  }, [state.selectedFontId])

  const getPaperPreset = useCallback(() => {
    return paperPresets.find((p) => p.id === state.selectedPaperId) || paperPresets[0]
  }, [state.selectedPaperId])

  const getDimensions = useCallback((): RenderDimensions => {
    return {
      pageWidth: PAGE_WIDTH,
      pageHeight: PAGE_HEIGHT,
      contentWidth: PAGE_WIDTH - state.marginLeft - state.marginRight,
      contentHeight: PAGE_HEIGHT - state.marginTop - state.marginBottom,
    }
  }, [state.marginLeft, state.marginRight, state.marginTop, state.marginBottom])

  const drawPaperBackground = useCallback(
    (ctx: CanvasRenderingContext2D, dims: RenderDimensions) => {
      const paper = getPaperPreset()

      ctx.fillStyle = state.paperBgColor || paper.bgColor
      ctx.fillRect(0, 0, dims.pageWidth, dims.pageHeight)

      const lineColor = state.paperLineColor || paper.lineColor
      const lineSpacing = state.paperLineSpacing || paper.lineSpacing

      if (paper.hasLines) {
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 0.5

        if (state.selectedPaperId === 'squared') {
          const gridSize = lineSpacing

          for (let x = state.marginLeft; x <= dims.pageWidth - state.marginRight; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, state.marginTop)
            ctx.lineTo(x, dims.pageHeight - state.marginBottom)
            ctx.stroke()
          }

          for (let y = state.marginTop; y <= dims.pageHeight - state.marginBottom; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(state.marginLeft, y)
            ctx.lineTo(dims.pageWidth - state.marginRight, y)
            ctx.stroke()
          }

          ctx.setLineDash([4, 4])
          for (let x = state.marginLeft; x <= dims.pageWidth - state.marginRight; x += gridSize) {
            const centerY = state.marginTop + gridSize / 2
            ctx.beginPath()
            ctx.moveTo(x, centerY)
            ctx.lineTo(x + gridSize, centerY)
            ctx.stroke()
          }
          for (let y = state.marginTop; y <= dims.pageHeight - state.marginBottom; y += gridSize) {
            const centerX = state.marginLeft + gridSize / 2
            ctx.beginPath()
            ctx.moveTo(centerX, y)
            ctx.lineTo(centerX, y + gridSize)
            ctx.stroke()
          }
          ctx.setLineDash([])
        } else if (state.selectedPaperId === 'grid') {
          const gridSize = lineSpacing

          for (let x = state.marginLeft; x <= dims.pageWidth - state.marginRight; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, state.marginTop)
            ctx.lineTo(x, dims.pageHeight - state.marginBottom)
            ctx.stroke()
          }

          for (let y = state.marginTop; y <= dims.pageHeight - state.marginBottom; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(state.marginLeft, y)
            ctx.lineTo(dims.pageWidth - state.marginRight, y)
            ctx.stroke()
          }
        } else {
          for (let y = state.marginTop; y <= dims.pageHeight - state.marginBottom; y += lineSpacing) {
            ctx.beginPath()
            ctx.moveTo(state.marginLeft, y)
            ctx.lineTo(dims.pageWidth - state.marginRight, y)
            ctx.stroke()
          }
        }
      }

      if (paper.hasMargin || state.showBindingLine) {
        ctx.strokeStyle = lineColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(state.marginLeft + 20, state.marginTop)
        ctx.lineTo(state.marginLeft + 20, dims.pageHeight - state.marginBottom)
        ctx.stroke()
      }
    },
    [
      state.paperBgColor,
      state.paperLineColor,
      state.paperLineSpacing,
      state.marginLeft,
      state.marginRight,
      state.marginTop,
      state.marginBottom,
      state.selectedPaperId,
      state.showBindingLine,
      getPaperPreset,
    ]
  )

  const calculateLines = useCallback(
    (text: string, ctx: CanvasRenderingContext2D, dims: RenderDimensions): string[][] => {
      const paragraphs = text.split(/\n\s*\n/)
      const pages: string[][] = []
      let currentPageLines: string[] = []

      const lineHeightPx = state.fontSize * state.lineHeight
      const maxLinesPerPage = Math.floor(dims.contentHeight / (lineHeightPx + state.paragraphSpacing / 10))

      paragraphs.forEach((paragraph) => {
        const lines: string[] = []
        let currentLine = ''

        const chars = paragraph.split('\n').join(' ').split('')
        for (const char of chars) {
          const testLine = currentLine + char
          const metrics = ctx.measureText(testLine)
          if (metrics.width > dims.contentWidth && currentLine !== '') {
            lines.push(currentLine)
            currentLine = char
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) {
          lines.push(currentLine)
        }

        for (const line of lines) {
          if (currentPageLines.length >= maxLinesPerPage) {
            pages.push(currentPageLines)
            currentPageLines = []
          }
          currentPageLines.push(line)
        }

        if (paragraph !== paragraphs[paragraphs.length - 1]) {
          if (currentPageLines.length >= maxLinesPerPage) {
            pages.push(currentPageLines)
            currentPageLines = []
          }
          currentPageLines.push('')
        }
      })

      if (currentPageLines.length > 0) {
        pages.push(currentPageLines)
      }

      return pages.length > 0 ? pages : [[]]
    },
    [state.fontSize, state.lineHeight, state.paragraphSpacing]
  )

  const drawText = useCallback(
    (ctx: CanvasRenderingContext2D, lines: string[], dims: RenderDimensions, pageIndex: number) => {
      ctx.fillStyle = state.inkColor
      ctx.font = `${state.fontSize}px ${getFontFamily()}`
      ctx.textBaseline = 'top'

      const lineHeightPx = state.fontSize * state.lineHeight
      const jitter = state.jitterAmount

      let y = state.marginTop
      const random = seededRandom(pageIndex * 10000 + 1)

      lines.forEach((line, lineIdx) => {
        let x = state.marginLeft
        const baseY = y

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === ' ') {
            const spaceWidth = ctx.measureText(' ').width + state.letterSpacing
            x += spaceWidth
            continue
          }

          const jitterX = (random() - 0.5) * jitter * state.fontSize * 0.5
          const jitterY = (random() - 0.5) * jitter * state.fontSize * 0.5
          const jitterRotate = (random() - 0.5) * jitter * 0.15

          const charMetrics = ctx.measureText(char)

          ctx.save()
          ctx.translate(x + jitterX + charMetrics.width / 2, baseY + jitterY + state.fontSize / 2)
          ctx.rotate(jitterRotate)
          ctx.fillText(char, -charMetrics.width / 2, -state.fontSize / 2)
          ctx.restore()

          x += charMetrics.width + state.letterSpacing
        }

        y += lineHeightPx
        if (line === '' && lineIdx < lines.length - 1) {
          y += state.paragraphSpacing
        }
      })
    },
    [
      state.inkColor,
      state.fontSize,
      state.marginLeft,
      state.marginTop,
      state.jitterAmount,
      state.letterSpacing,
      state.lineHeight,
      state.paragraphSpacing,
      getFontFamily,
    ]
  )

  const getPageCount = useCallback((): number => {
    if (!canvasRef.current) return 1
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return 1

    const dims = getDimensions()
    ctx.font = `${state.fontSize}px ${getFontFamily()}`
    const pages = calculateLines(state.rawText, ctx, dims)
    return pages.length
  }, [state.rawText, state.fontSize, getDimensions, getFontFamily, calculateLines, canvasRef])

  const render = useCallback(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dims = getDimensions()
    canvas.width = dims.pageWidth
    canvas.height = dims.pageHeight

    const pages = calculateLines(state.rawText, ctx, dims)
    const totalPages = pages.length

    if (totalPages !== state.totalPages) {
      useWorkspaceStore.getState().setTotalPages(totalPages)
    }

    const pageIdx = Math.min(state.currentPage - 1, totalPages - 1)

    ctx.clearRect(0, 0, dims.pageWidth, dims.pageHeight)
    drawPaperBackground(ctx, dims)
    drawText(ctx, pages[pageIdx] || [], dims, pageIdx)
  }, [
    state.rawText,
    state.currentPage,
    state.totalPages,
    getDimensions,
    calculateLines,
    drawPaperBackground,
    drawText,
    canvasRef,
  ])

  useEffect(() => {
    render()
  }, [render])

  return {
    canvasRef,
    render,
    getPageCount,
    getDimensions,
  }
}
