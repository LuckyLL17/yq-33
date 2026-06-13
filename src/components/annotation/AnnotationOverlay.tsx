import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type {
  Annotation,
  AnnotationStyle,
} from '@/store/useWorkspaceStore'
import AnnotationToolbar from './AnnotationToolbar'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const DPR = 2

type DrawState = {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  points: { x: number; y: number }[]
  tempText: string
}

export default function AnnotationOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const [drawState, setDrawState] = useState<DrawState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    points: [],
    tempText: '',
  })
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 })

  const [undoStack, setUndoStack] = useState<Annotation[][]>([])
  const [redoStack, setRedoStack] = useState<Annotation[][]>([])

  const {
    annotations,
    addAnnotation,
    deleteAnnotation,
    clearPageAnnotations,
    currentPage,
    setIsAnnotating,
    activeAnnotationTool,
    annotationStyle,
    addAnnotationPreset,
  } = useWorkspaceStore()

  const currentPageIdx = currentPage - 1

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = PAGE_WIDTH / rect.width
      const scaleY = PAGE_HEIGHT / rect.height

      let clientX: number, clientY: number
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX
        clientY = e.changedTouches[0].clientY
      } else {
        clientX = (e as React.MouseEvent).clientX
        clientY = (e as React.MouseEvent).clientY
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const setupContext = useCallback(
    (ctx: CanvasRenderingContext2D, style: AnnotationStyle) => {
      ctx.strokeStyle = style.color
      ctx.lineWidth = style.strokeWidth
      ctx.globalAlpha = style.opacity ?? 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.fillStyle = style.fillColor || 'transparent'
    },
    []
  )

  const clearOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }, [])

  const redrawBaseCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    ctx.save()
    ctx.scale(DPR, DPR)

    annotations
      .filter((a) => a.pageIndex === currentPageIdx)
      .forEach((ann) => {
        drawAnnotationToContext(ctx, ann)
      })

    ctx.restore()
  }, [annotations, currentPageIdx])

  const drawAnnotationToContext = useCallback(
    (ctx: CanvasRenderingContext2D, ann: Annotation) => {
      setupContext(ctx, ann.style)

      switch (ann.type) {
        case 'path':
        case 'highlight': {
          if (ann.points.length < 2) {
            if (ann.points.length === 1) {
              ctx.fillStyle = ann.style.color
              ctx.beginPath()
              ctx.arc(ann.points[0].x, ann.points[0].y, ann.style.strokeWidth / 2, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.globalAlpha = 1
            return
          }
          ctx.beginPath()
          ctx.moveTo(ann.points[0].x, ann.points[0].y)
          for (let i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x, ann.points[i].y)
          }
          ctx.stroke()
          break
        }
        case 'circle': {
          ctx.beginPath()
          const cx = ann.x + ann.width / 2
          const cy = ann.y + ann.height / 2
          const rx = Math.abs(ann.width) / 2
          const ry = Math.abs(ann.height) / 2
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          if (ann.style.fillColor) ctx.fill()
          ctx.stroke()
          break
        }
        case 'rect': {
          ctx.beginPath()
          ctx.rect(ann.x, ann.y, ann.width, ann.height)
          if (ann.style.fillColor) ctx.fill()
          ctx.stroke()
          break
        }
        case 'line':
        case 'arrow': {
          ctx.beginPath()
          ctx.moveTo(ann.x1, ann.y1)
          ctx.lineTo(ann.x2, ann.y2)
          ctx.stroke()
          if (ann.type === 'arrow') {
            const headLen = ann.style.strokeWidth * 6
            const angle = Math.atan2(ann.y2 - ann.y1, ann.x2 - ann.x1)
            ctx.fillStyle = ann.style.color
            ctx.beginPath()
            ctx.moveTo(ann.x2, ann.y2)
            ctx.lineTo(
              ann.x2 - headLen * Math.cos(angle - Math.PI / 6),
              ann.y2 - headLen * Math.sin(angle - Math.PI / 6)
            )
            ctx.lineTo(
              ann.x2 - headLen * Math.cos(angle + Math.PI / 6),
              ann.y2 - headLen * Math.sin(angle + Math.PI / 6)
            )
            ctx.closePath()
            ctx.fill()
          }
          break
        }
        case 'underline':
        case 'wavy': {
          const { x, y, width } = ann
          ctx.beginPath()
          if (ann.type === 'underline') {
            ctx.moveTo(x, y)
            ctx.lineTo(x + width, y)
            ctx.stroke()
          } else {
            const step = 6
            const amplitude = 3
            ctx.moveTo(x, y)
            let curX = x
            let goingUp = true
            while (curX < x + width) {
              const nextX = Math.min(curX + step, x + width)
              const midX = (curX + nextX) / 2
              const midY = y + (goingUp ? -amplitude : amplitude)
              ctx.quadraticCurveTo(midX, midY, nextX, y)
              curX = nextX
              goingUp = !goingUp
            }
            ctx.stroke()
          }
          break
        }
        case 'text': {
          ctx.fillStyle = ann.style.color
          const fontSize = ann.style.fontSize || 20
          const fontFamily =
            ann.style.fontFamily || '"Ma Shan Zheng", "KaiTi", cursive, serif'
          ctx.font = `400 ${fontSize}px ${fontFamily}`
          ctx.textBaseline = 'top'
          ctx.fillText(ann.text, ann.x, ann.y)
          break
        }
      }

      ctx.globalAlpha = 1
    },
    [setupContext]
  )

  const drawPreviewShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      tool: string,
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ) => {
      setupContext(ctx, annotationStyle)

      switch (tool) {
        case 'circle': {
          const x = Math.min(startX, endX)
          const y = Math.min(startY, endY)
          const w = Math.abs(endX - startX)
          const h = Math.abs(endY - startY)
          ctx.beginPath()
          ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
          ctx.stroke()
          break
        }
        case 'rect': {
          ctx.beginPath()
          ctx.rect(startX, startY, endX - startX, endY - startY)
          ctx.stroke()
          break
        }
        case 'line':
        case 'arrow': {
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
          if (tool === 'arrow') {
            const headLen = annotationStyle.strokeWidth * 6
            const angle = Math.atan2(endY - startY, endX - startX)
            ctx.fillStyle = annotationStyle.color
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - headLen * Math.cos(angle - Math.PI / 6),
              endY - headLen * Math.sin(angle - Math.PI / 6)
            )
            ctx.lineTo(
              endX - headLen * Math.cos(angle + Math.PI / 6),
              endY - headLen * Math.sin(angle + Math.PI / 6)
            )
            ctx.closePath()
            ctx.fill()
          }
          break
        }
        case 'underline':
        case 'wavy': {
          const x = Math.min(startX, endX)
          const width = Math.abs(endX - startX)
          ctx.beginPath()
          if (tool === 'underline') {
            ctx.moveTo(x, startY)
            ctx.lineTo(x + width, startY)
            ctx.stroke()
          } else {
            const step = 6
            const amplitude = 3
            ctx.moveTo(x, startY)
            let curX = x
            let goingUp = true
            while (curX < x + width) {
              const nextX = Math.min(curX + step, x + width)
              const midX = (curX + nextX) / 2
              const midY = startY + (goingUp ? -amplitude : amplitude)
              ctx.quadraticCurveTo(midX, midY, nextX, startY)
              curX = nextX
              goingUp = !goingUp
            }
            ctx.stroke()
          }
          break
        }
      }

      ctx.globalAlpha = 1
    },
    [annotationStyle, setupContext]
  )

  const startInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (showTextInput) return
      const pos = getPosition(e)

      if (activeAnnotationTool === 'text') {
        setTextInputPos(pos)
        setShowTextInput(true)
        setDrawState({
          isDrawing: false,
          startX: pos.x,
          startY: pos.y,
          currentX: pos.x,
          currentY: pos.y,
          points: [],
          tempText: '',
        })
        setTimeout(() => textInputRef.current?.focus(), 50)
        return
      }

      if (activeAnnotationTool === 'eraser') {
        const pageAnnotations = annotations.filter(
          (a) => a.pageIndex === currentPageIdx
        )
        const erasedIds = new Set<string>()
        for (const ann of pageAnnotations) {
          if (isPointNearAnnotation(pos.x, pos.y, ann, annotationStyle.strokeWidth + 8)) {
            erasedIds.add(ann.id)
          }
        }
        if (erasedIds.size > 0) {
          saveStateToUndo()
          erasedIds.forEach((id) => deleteAnnotation(id))
        }
        return
      }

      saveStateToUndo()

      setDrawState({
        isDrawing: true,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        points: [pos],
        tempText: '',
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activeAnnotationTool,
      getPosition,
      annotations,
      currentPageIdx,
      annotationStyle.strokeWidth,
      showTextInput,
    ]
  )

  const isPointNearAnnotation = (
    px: number,
    py: number,
    ann: Annotation,
    threshold: number
  ): boolean => {
    switch (ann.type) {
      case 'path':
      case 'highlight':
        return ann.points.some(
          (p) => Math.hypot(p.x - px, p.y - py) < threshold
        )
      case 'circle': {
        const cx = ann.x + ann.width / 2
        const cy = ann.y + ann.height / 2
        const rx = Math.abs(ann.width) / 2
        const ry = Math.abs(ann.height) / 2
        const dx = (px - cx) / (rx || 1)
        const dy = (py - cy) / (ry || 1)
        return Math.abs(dx * dx + dy * dy - 1) < 0.3
      }
      case 'rect': {
        return (
          px >= ann.x - threshold &&
          px <= ann.x + ann.width + threshold &&
          py >= ann.y - threshold &&
          py <= ann.y + ann.height + threshold &&
          !(
            px > ann.x + threshold &&
            px < ann.x + ann.width - threshold &&
            py > ann.y + threshold &&
            py < ann.y + ann.height - threshold
          )
        )
      }
      case 'line':
      case 'arrow': {
        const dist = pointToLineDistance(px, py, ann.x1, ann.y1, ann.x2, ann.y2)
        return dist < threshold
      }
      case 'underline':
      case 'wavy':
        return (
          px >= ann.x - threshold &&
          px <= ann.x + ann.width + threshold &&
          Math.abs(py - ann.y) < threshold
        )
      case 'text': {
        const fontSize = ann.style.fontSize || 20
        const approxWidth = ann.text.length * fontSize * 0.6
        return (
          px >= ann.x - threshold &&
          px <= ann.x + approxWidth + threshold &&
          py >= ann.y - threshold &&
          py <= ann.y + fontSize + threshold
        )
      }
    }
  }

  const pointToLineDistance = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = lenSq !== 0 ? dot / lenSq : -1
    param = Math.max(0, Math.min(1, param))
    const xx = x1 + param * C
    const yy = y1 + param * D
    return Math.hypot(px - xx, py - yy)
  }

  const saveStateToUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-30), [...annotations]])
    setRedoStack([])
  }, [annotations])

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    const prevState = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setRedoStack((prev) => [...prev.slice(-30), [...annotations]])
    useWorkspaceStore.getState().loadAnnotations(prevState)
  }, [undoStack, annotations])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    const nextState = redoStack[redoStack.length - 1]
    setRedoStack((prev) => prev.slice(0, -1))
    setUndoStack((prev) => [...prev.slice(-30), [...annotations]])
    useWorkspaceStore.getState().loadAnnotations(nextState)
  }, [redoStack, annotations])

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawState.isDrawing) return
      const pos = getPosition(e)

      setDrawState((prev) => ({
        ...prev,
        currentX: pos.x,
        currentY: pos.y,
        points:
          activeAnnotationTool === 'pen' || activeAnnotationTool === 'highlighter'
            ? [...prev.points, pos]
            : prev.points,
      }))

      if (
        activeAnnotationTool !== 'pen' &&
        activeAnnotationTool !== 'highlighter'
      ) {
        const overlayCanvas = overlayCanvasRef.current
        if (!overlayCanvas) return
        const ctx = overlayCanvas.getContext('2d')
        if (!ctx) return
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        ctx.restore()
        ctx.save()
        ctx.scale(DPR, DPR)
        drawPreviewShape(
          ctx,
          activeAnnotationTool,
          drawState.startX,
          drawState.startY,
          pos.x,
          pos.y
        )
        ctx.restore()
      } else {
        const overlayCanvas = overlayCanvasRef.current
        if (!overlayCanvas) return
        const ctx = overlayCanvas.getContext('2d')
        if (!ctx) return
        setupContext(ctx, annotationStyle)
        const points = [...drawState.points, pos]
        if (points.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
    },
    [drawState, activeAnnotationTool, getPosition, drawPreviewShape, setupContext, annotationStyle]
  )

  const createAnnotationFromDraw = useCallback(() => {
    if (!drawState.isDrawing) return

    const baseStyle: AnnotationStyle = { ...annotationStyle }
    const { startX, startY, currentX, currentY, points } = drawState

    switch (activeAnnotationTool) {
      case 'pen':
      case 'highlighter': {
        if (points.length > 0) {
          addAnnotation({
            type: activeAnnotationTool === 'pen' ? 'path' : 'highlight',
            pageIndex: currentPageIdx,
            style: baseStyle,
            points,
          })
        }
        break
      }
      case 'circle': {
        const x = Math.min(startX, currentX)
        const y = Math.min(startY, currentY)
        const w = Math.abs(currentX - startX)
        const h = Math.abs(currentY - startY)
        if (w > 2 || h > 2) {
          addAnnotation({
            type: 'circle',
            pageIndex: currentPageIdx,
            style: baseStyle,
            x,
            y,
            width: w,
            height: h,
          })
        }
        break
      }
      case 'rect': {
        const w = currentX - startX
        const h = currentY - startY
        if (Math.abs(w) > 2 || Math.abs(h) > 2) {
          addAnnotation({
            type: 'rect',
            pageIndex: currentPageIdx,
            style: baseStyle,
            x: Math.min(startX, currentX),
            y: Math.min(startY, currentY),
            width: Math.abs(w),
            height: Math.abs(h),
          })
        }
        break
      }
      case 'line':
      case 'arrow': {
        const dist = Math.hypot(currentX - startX, currentY - startY)
        if (dist > 2) {
          addAnnotation({
            type: activeAnnotationTool as 'line' | 'arrow',
            pageIndex: currentPageIdx,
            style: baseStyle,
            x1: startX,
            y1: startY,
            x2: currentX,
            y2: currentY,
          })
        }
        break
      }
      case 'underline':
      case 'wavy': {
        const width = Math.abs(currentX - startX)
        if (width > 5) {
          addAnnotation({
            type: activeAnnotationTool as 'underline' | 'wavy',
            pageIndex: currentPageIdx,
            style: baseStyle,
            x: Math.min(startX, currentX),
            y: startY,
            width,
          })
        }
        break
      }
    }

    clearOverlay()
    setDrawState({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      points: [],
      tempText: '',
    })
  }, [drawState, activeAnnotationTool, annotationStyle, currentPageIdx, addAnnotation, clearOverlay])

  const handleEnd = useCallback(() => {
    createAnnotationFromDraw()
  }, [createAnnotationFromDraw])

  const handleTextSubmit = useCallback(() => {
    const text = drawState.tempText.trim()
    if (text) {
      saveStateToUndo()
      addAnnotation({
        type: 'text',
        pageIndex: currentPageIdx,
        style: annotationStyle,
        x: textInputPos.x,
        y: textInputPos.y,
        text,
      })
    }
    setShowTextInput(false)
    setDrawState({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      points: [],
      tempText: '',
    })
  }, [drawState.tempText, addAnnotation, currentPageIdx, annotationStyle, textInputPos, saveStateToUndo])

  const handleClearPage = useCallback(() => {
    const pageAnns = annotations.filter((a) => a.pageIndex === currentPageIdx)
    if (pageAnns.length === 0) return
    saveStateToUndo()
    clearPageAnnotations(currentPageIdx)
  }, [annotations, currentPageIdx, clearPageAnnotations, saveStateToUndo])

  const handleSavePreset = useCallback(() => {
    const toolNames: Record<string, string> = {
      pen: '画笔',
      highlighter: '荧光笔',
      circle: '圆圈',
      rect: '方框',
      line: '直线',
      arrow: '箭头',
      underline: '下划线',
      wavy: '波浪线',
      text: '文字',
    }
    const name = `${toolNames[activeAnnotationTool] || '自定义'} ${annotationStyle.color}`
    addAnnotationPreset({
      name,
      tool: activeAnnotationTool,
      style: { ...annotationStyle },
    })
  }, [activeAnnotationTool, annotationStyle, addAnnotationPreset])

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayCanvasRef.current
    if (!canvas || !overlay) return

    canvas.width = PAGE_WIDTH * DPR
    canvas.height = PAGE_HEIGHT * DPR
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`

    overlay.width = PAGE_WIDTH * DPR
    overlay.height = PAGE_HEIGHT * DPR
    overlay.style.width = `${PAGE_WIDTH}px`
    overlay.style.height = `${PAGE_HEIGHT}px`

    redrawBaseCanvas()
  }, [])

  useEffect(() => {
    redrawBaseCanvas()
  }, [annotations, currentPageIdx, redrawBaseCanvas])

  return (
    <div className="absolute inset-0 z-10">
      <AnnotationToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onClearPage={handleClearPage}
        onSavePreset={handleSavePreset}
        onClose={() => setIsAnnotating(false)}
      />

      <div className="absolute inset-0 top-[52px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className={cn(
            'absolute inset-0 z-0',
            'w-full h-full',
            'pointer-events-none'
          )}
        />
        <canvas
          ref={overlayCanvasRef}
          className={cn(
            'absolute inset-0 z-10',
            'w-full h-full',
            activeAnnotationTool === 'text' ? 'cursor-text' :
            activeAnnotationTool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair',
            'touch-none'
          )}
          onMouseDown={startInteraction}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={startInteraction}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {showTextInput && (
          <div
            className="absolute z-20"
            style={{
              left: `${(textInputPos.x / PAGE_WIDTH) * 100}%`,
              top: `${(textInputPos.y / PAGE_HEIGHT) * 100}%`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={drawState.tempText}
              onChange={(e) =>
                setDrawState((prev) => ({ ...prev, tempText: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit()
                if (e.key === 'Escape') {
                  setShowTextInput(false)
                  setDrawState((prev) => ({ ...prev, tempText: '' }))
                }
              }}
              onBlur={handleTextSubmit}
              placeholder="输入文字..."
              className={cn(
                'outline-none border-none bg-transparent',
                'whitespace-nowrap min-w-[80px] pr-2',
                'shadow-[0_0_0_2px_rgba(244,63,94,0.5)] rounded px-1',
                'backdrop-blur-sm bg-white/80'
              )}
              style={{
                color: annotationStyle.color,
                fontSize: `${annotationStyle.fontSize || 20}px`,
                fontFamily:
                  annotationStyle.fontFamily ||
                  '"Ma Shan Zheng", "KaiTi", cursive, serif',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
