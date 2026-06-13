import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { AnnotationStyle } from '@/store/useWorkspaceStore'
import AnnotationToolbar from './AnnotationToolbar'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const DPR = 2

type DrawState = {
  isDrawing: boolean
  startX: number
  startY: number
  endX: number
  endY: number
  points: { x: number; y: number }[]
  tempText: string
}

export default function AnnotationOverlay() {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  const [drawState, setDrawState] = useState<DrawState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    points: [],
    tempText: '',
  })
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 })

  const [undoStack, setUndoStack] = useState<string>(JSON.stringify([]))
  const [redoStack, setRedoStack] = useState<string>(JSON.stringify([]))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const annotations = useWorkspaceStore((s) => s.annotations)
  const addAnnotation = useWorkspaceStore((s) => s.addAnnotation)
  const deleteAnnotation = useWorkspaceStore((s) => s.deleteAnnotation)
  const clearPageAnnotations = useWorkspaceStore((s) => s.clearPageAnnotations)
  const currentPage = useWorkspaceStore((s) => s.currentPage)
  const setIsAnnotating = useWorkspaceStore((s) => s.setIsAnnotating)
  const activeAnnotationTool = useWorkspaceStore((s) => s.activeAnnotationTool)
  const annotationStyle = useWorkspaceStore((s) => s.annotationStyle)
  const addAnnotationPreset = useWorkspaceStore((s) => s.addAnnotationPreset)
  const loadAnnotations = useWorkspaceStore((s) => s.loadAnnotations)

  const currentPageIdx = currentPage - 1

  const annotationsRef = useRef(annotations)
  useEffect(() => {
    annotationsRef.current = annotations
  }, [annotations])

  const saveStateToUndo = useCallback(() => {
    const current = JSON.stringify(annotationsRef.current)
    setUndoStack((prev) => {
      const arr = JSON.parse(prev)
      const newArr = [...arr, current].slice(-30)
      setCanUndo(newArr.length > 0)
      return JSON.stringify(newArr)
    })
    setRedoStack(JSON.stringify([]))
    setCanRedo(false)
  }, [])

  const handleUndo = useCallback(() => {
    setUndoStack((prevUndo) => {
      const undoArr = JSON.parse(prevUndo)
      if (undoArr.length === 0) return prevUndo

      const prevState = undoArr[undoArr.length - 1]
      const newUndo = undoArr.slice(0, -1)

      const current = JSON.stringify(annotationsRef.current)
      setRedoStack((prevRedo) => {
        const redoArr = JSON.parse(prevRedo)
        const newRedo = [...redoArr, current].slice(-30)
        setCanRedo(newRedo.length > 0)
        return JSON.stringify(newRedo)
      })

      loadAnnotations(JSON.parse(prevState))
      setCanUndo(newUndo.length > 0)
      return JSON.stringify(newUndo)
    })
  }, [loadAnnotations])

  const handleRedo = useCallback(() => {
    setRedoStack((prevRedo) => {
      const redoArr = JSON.parse(prevRedo)
      if (redoArr.length === 0) return prevRedo

      const nextState = redoArr[redoArr.length - 1]
      const newRedo = redoArr.slice(0, -1)

      const current = JSON.stringify(annotationsRef.current)
      setUndoStack((prevUndo) => {
        const undoArr = JSON.parse(prevUndo)
        const newUndo = [...undoArr, current].slice(-30)
        setCanUndo(newUndo.length > 0)
        return JSON.stringify(newUndo)
      })

      loadAnnotations(JSON.parse(nextState))
      setCanRedo(newRedo.length > 0)
      return JSON.stringify(newRedo)
    })
  }, [loadAnnotations])

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = overlayCanvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = PAGE_WIDTH / rect.width
      const scaleY = PAGE_HEIGHT / rect.height

      let clientX = 0
      let clientY = 0
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX
        clientY = e.changedTouches[0].clientY
      } else {
        const me = e as React.MouseEvent
        clientX = me.clientX
        clientY = me.clientY
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const clearOverlayCanvas = useCallback(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }, [])

  const drawShapeOnCanvas = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      tool: string,
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      style: AnnotationStyle
    ) => {
      ctx.save()
      ctx.strokeStyle = style.color
      ctx.lineWidth = style.strokeWidth
      ctx.globalAlpha = style.opacity ?? 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

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
            const headLen = style.strokeWidth * 6
            const angle = Math.atan2(endY - startY, endX - startX)
            ctx.fillStyle = style.color
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

      ctx.restore()
    },
    []
  )

  const isPointNearAnnotation = (
    px: number,
    py: number,
    ann: any,
    threshold: number
  ): boolean => {
    switch (ann.type) {
      case 'path':
      case 'highlight':
        return ann.points?.some(
          (p: { x: number; y: number }) => Math.hypot(p.x - px, p.y - py) < threshold
        ) ?? false
      case 'circle': {
        const cx = (ann.x ?? 0) + (ann.width ?? 0) / 2
        const cy = (ann.y ?? 0) + (ann.height ?? 0) / 2
        const rx = Math.abs(ann.width ?? 1) / 2
        const ry = Math.abs(ann.height ?? 1) / 2
        const dx = (px - cx) / (rx || 1)
        const dy = (py - cy) / (ry || 1)
        return Math.abs(dx * dx + dy * dy - 1) < 0.3
      }
      case 'rect': {
        const ax = ann.x ?? 0
        const ay = ann.y ?? 0
        const aw = ann.width ?? 0
        const ah = ann.height ?? 0
        return (
          px >= ax - threshold &&
          px <= ax + aw + threshold &&
          py >= ay - threshold &&
          py <= ay + ah + threshold &&
          !(
            px > ax + threshold &&
            px < ax + aw - threshold &&
            py > ay + threshold &&
            py < ay + ah - threshold
          )
        )
      }
      case 'line':
      case 'arrow': {
        const dist = pointToLineDistance(
          px,
          py,
          ann.x1 ?? 0,
          ann.y1 ?? 0,
          ann.x2 ?? 0,
          ann.y2 ?? 0
        )
        return dist < threshold
      }
      case 'underline':
      case 'wavy':
        return (
          px >= (ann.x ?? 0) - threshold &&
          px <= (ann.x ?? 0) + (ann.width ?? 0) + threshold &&
          Math.abs(py - (ann.y ?? 0)) < threshold
        )
      case 'text': {
        const fontSize = ann.style?.fontSize || 20
        const approxWidth = (ann.text?.length || 0) * fontSize * 0.6
        return (
          px >= (ann.x ?? 0) - threshold &&
          px <= (ann.x ?? 0) + approxWidth + threshold &&
          py >= (ann.y ?? 0) - threshold &&
          py <= (ann.y ?? 0) + fontSize + threshold
        )
      }
      default:
        return false
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
          endX: pos.x,
          endY: pos.y,
          points: [],
          tempText: '',
        })
        setTimeout(() => textInputRef.current?.focus(), 50)
        return
      }

      if (activeAnnotationTool === 'eraser') {
        const pageAnnotations = annotationsRef.current.filter(
          (a) => a.pageIndex === currentPageIdx
        )
        const erasedIds: string[] = []
        for (const ann of pageAnnotations) {
          if (
            isPointNearAnnotation(
              pos.x,
              pos.y,
              ann,
              annotationStyle.strokeWidth + 8
            )
          ) {
            erasedIds.push(ann.id)
          }
        }
        if (erasedIds.length > 0) {
          saveStateToUndo()
          erasedIds.forEach((id) => deleteAnnotation(id))
        }
        return
      }

      if (
        activeAnnotationTool === 'pen' ||
        activeAnnotationTool === 'highlighter'
      ) {
        saveStateToUndo()
        setDrawState({
          isDrawing: true,
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          points: [pos],
          tempText: '',
        })
      } else {
        saveStateToUndo()
        setDrawState({
          isDrawing: true,
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          points: [],
          tempText: '',
        })
      }
    },
    [
      activeAnnotationTool,
      getPosition,
      currentPageIdx,
      annotationStyle.strokeWidth,
      showTextInput,
      saveStateToUndo,
      deleteAnnotation,
    ]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawState.isDrawing) return
      const pos = getPosition(e)

      if (
        activeAnnotationTool === 'pen' ||
        activeAnnotationTool === 'highlighter'
      ) {
        setDrawState((prev) => ({
          ...prev,
          endX: pos.x,
          endY: pos.y,
          points: [...prev.points, pos],
        }))

        const canvas = overlayCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.save()
        ctx.scale(DPR, DPR)
        ctx.strokeStyle = annotationStyle.color
        ctx.lineWidth = annotationStyle.strokeWidth
        ctx.globalAlpha = annotationStyle.opacity ?? 1
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        const pts = drawState.points
        if (pts.length > 0) {
          const last = pts[pts.length - 1]
          ctx.beginPath()
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
        }
        ctx.restore()
      } else {
        setDrawState((prev) => ({
          ...prev,
          endX: pos.x,
          endY: pos.y,
        }))
        clearOverlayCanvas()
        const canvas = overlayCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.save()
        ctx.scale(DPR, DPR)
        drawShapeOnCanvas(
          ctx,
          activeAnnotationTool,
          drawState.startX,
          drawState.startY,
          pos.x,
          pos.y,
          annotationStyle
        )
        ctx.restore()
      }
    },
    [
      drawState,
      activeAnnotationTool,
      getPosition,
      annotationStyle,
      clearOverlayCanvas,
      drawShapeOnCanvas,
    ]
  )

  const createAnnotationFromDraw = useCallback(() => {
    if (!drawState.isDrawing) return

    const { startX, startY, endX, endY, points } = drawState

    if (activeAnnotationTool === 'pen' || activeAnnotationTool === 'highlighter') {
      if (points.length > 0) {
        addAnnotation({
          type: activeAnnotationTool === 'pen' ? 'path' : 'highlight',
          pageIndex: currentPageIdx,
          style: { ...annotationStyle },
          points,
        })
      }
    } else {
      switch (activeAnnotationTool) {
        case 'circle': {
          const x = Math.min(startX, endX)
          const y = Math.min(startY, endY)
          const w = Math.abs(endX - startX)
          const h = Math.abs(endY - startY)
          if (w > 2 || h > 2) {
            addAnnotation({
              type: 'circle',
              pageIndex: currentPageIdx,
              style: { ...annotationStyle },
              x,
              y,
              width: w,
              height: h,
            })
          }
          break
        }
        case 'rect': {
          const w = endX - startX
          const h = endY - startY
          if (Math.abs(w) > 2 || Math.abs(h) > 2) {
            addAnnotation({
              type: 'rect',
              pageIndex: currentPageIdx,
              style: { ...annotationStyle },
              x: Math.min(startX, endX),
              y: Math.min(startY, endY),
              width: Math.abs(w),
              height: Math.abs(h),
            })
          }
          break
        }
        case 'line':
        case 'arrow': {
          const dist = Math.hypot(endX - startX, endY - startY)
          if (dist > 2) {
            addAnnotation({
              type: activeAnnotationTool,
              pageIndex: currentPageIdx,
              style: { ...annotationStyle },
              x1: startX,
              y1: startY,
              x2: endX,
              y2: endY,
            })
          }
          break
        }
        case 'underline':
        case 'wavy': {
          const width = Math.abs(endX - startX)
          if (width > 5) {
            addAnnotation({
              type: activeAnnotationTool,
              pageIndex: currentPageIdx,
              style: { ...annotationStyle },
              x: Math.min(startX, endX),
              y: startY,
              width,
            })
          }
          break
        }
      }
    }

    clearOverlayCanvas()
    setDrawState({
      isDrawing: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      points: [],
      tempText: '',
    })
  }, [drawState, activeAnnotationTool, annotationStyle, currentPageIdx, addAnnotation, clearOverlayCanvas])

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
        style: { ...annotationStyle },
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
      endX: 0,
      endY: 0,
      points: [],
      tempText: '',
    })
  }, [
    drawState.tempText,
    addAnnotation,
    currentPageIdx,
    annotationStyle,
    textInputPos,
    saveStateToUndo,
  ])

  const handleClearPage = useCallback(() => {
    const pageAnns = annotationsRef.current.filter(
      (a) => a.pageIndex === currentPageIdx
    )
    if (pageAnns.length === 0) return
    saveStateToUndo()
    clearPageAnnotations(currentPageIdx)
  }, [currentPageIdx, clearPageAnnotations, saveStateToUndo])

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
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    canvas.width = PAGE_WIDTH * DPR
    canvas.height = PAGE_HEIGHT * DPR
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`
  }, [])

  return (
    <div className="absolute inset-0 z-10">
      <AnnotationToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClearPage={handleClearPage}
        onSavePreset={handleSavePreset}
        onClose={() => setIsAnnotating(false)}
      />

      <div className="absolute inset-0 top-[52px] overflow-hidden">
        <canvas
          ref={overlayCanvasRef}
          className={cn(
            'absolute inset-0 z-10',
            'w-full h-full',
            activeAnnotationTool === 'text'
              ? 'cursor-text'
              : activeAnnotationTool === 'eraser'
                ? 'cursor-cell'
                : 'cursor-crosshair',
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
