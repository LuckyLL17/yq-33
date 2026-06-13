import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, RotateCcw, Pen, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { paperPresets } from '@/constants/presets'
import { getSignatureBounds, extractSignatureDataUrl } from '@/utils/signatureRenderer'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const DPR = 2

export default function DirectSignatureOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#3a2e1f')
  const [hasContent, setHasContent] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])

  const addSignature = useWorkspaceStore((s) => s.addSignature)
  const addSignaturePlacement = useWorkspaceStore((s) => s.addSignaturePlacement)
  const currentPage = useWorkspaceStore((s) => s.currentPage)
  const setIsDirectSigning = useWorkspaceStore((s) => s.setIsDirectSigning)
  const { selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing } = useWorkspaceStore()

  const getPaperInfo = useCallback(() => {
    const paper = paperPresets.find((p) => p.id === selectedPaperId) || paperPresets[0]
    const typeMap: Record<string, string> = {
      blank: 'blank', line: 'line', grid: 'grid', squared: 'grid',
      notebook: 'line', kraft: 'kraft', newspaper: 'blank', dotted: 'dotted',
    }
    return {
      paperBgColor: paperBgColor || paper.bgColor,
      paperLineColor: paperLineColor || paper.lineColor,
      paperLineSpacing: paperLineSpacing || paper.lineSpacing,
      paperType: typeMap[selectedPaperId] || 'line',
    }
  }, [selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = PAGE_WIDTH * DPR
    canvas.height = PAGE_HEIGHT * DPR
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(DPR, DPR)

    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory((prev) => [...prev.slice(-20), imageData])
  }, [])

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = PAGE_WIDTH / rect.width
    const scaleY = PAGE_HEIGHT / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    saveState()

    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPosition(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setHasContent(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    saveState()
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    setHasContent(false)
  }

  const undo = () => {
    if (history.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lastState = history[history.length - 1]
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.putImageData(lastState, 0, 0)
    ctx.restore()
    setHistory((prev) => prev.slice(0, -1))

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let hasPixels = false
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 50) {
        hasPixels = true
        break
      }
    }
    setHasContent(hasPixels)
  }

  const getCenterPoint = (canvas: HTMLCanvasElement): { x: number; y: number } => {
    const bounds = getSignatureBounds(canvas, false)
    const logicalBounds = {
      left: bounds.left / DPR,
      top: bounds.top / DPR,
      right: bounds.right / DPR,
      bottom: bounds.bottom / DPR,
    }
    return {
      x: (logicalBounds.left + logicalBounds.right) / 2,
      y: (logicalBounds.top + logicalBounds.bottom) / 2,
    }
  }

  const saveAndPlace = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasContent) return

    const bounds = getSignatureBounds(canvas, false)
    const { dataUrl, width, height } = extractSignatureDataUrl(canvas, bounds, 10, false)

    if (width <= 20 || height <= 20) return

    const name = `签名 ${useWorkspaceStore.getState().signatures.length + 1}`
    const pi = getPaperInfo()
    const tempId = `sig_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const state = useWorkspaceStore.getState()
    useWorkspaceStore.setState({
      signatures: [
        ...state.signatures,
        {
          name,
          dataUrl,
          width: width / DPR,
          height: height / DPR,
          bgOpacity: 0,
          paperId: selectedPaperId,
          paperBgColor: pi.paperBgColor,
          paperLineColor: pi.paperLineColor,
          paperLineSpacing: pi.paperLineSpacing,
          paperType: pi.paperType,
          id: tempId,
          createdAt: Date.now(),
        },
      ],
    })

    const center = getCenterPoint(canvas)
    const newState = useWorkspaceStore.getState()
    useWorkspaceStore.setState({
      signaturePlacements: [
        ...newState.signaturePlacements,
        {
          signatureId: tempId,
          pageIndex: currentPage - 1,
          x: center.x,
          y: center.y,
          scale: 1,
        },
      ],
      isPlacingSignature: false,
      selectedSignatureId: null,
    })

    setIsDirectSigning(false)
  }

  const saveToPresets = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasContent) return

    const bounds = getSignatureBounds(canvas, false)
    const { dataUrl, width, height } = extractSignatureDataUrl(canvas, bounds, 10, false)

    if (width <= 20 || height <= 20) return

    const name = `签名 ${useWorkspaceStore.getState().signatures.length + 1}`
    const pi = getPaperInfo()

    addSignature({
      name,
      dataUrl,
      width: width / DPR,
      height: height / DPR,
      bgOpacity: 0,
      paperId: selectedPaperId,
      paperBgColor: pi.paperBgColor,
      paperLineColor: pi.paperLineColor,
      paperLineSpacing: pi.paperLineSpacing,
      paperType: pi.paperType,
    })

    setIsDirectSigning(false)
  }

  const handleClose = () => {
    setIsDirectSigning(false)
  }

  return (
    <>
      <div
        className={cn(
          'absolute z-20',
          'top-0 left-0 right-0',
          'flex items-center justify-center',
          'px-4 py-2.5',
          'bg-white/90 backdrop-blur-sm',
          'border-b border-amber-300',
          'shadow-md shadow-amber-900/10'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 border border-amber-200">
            <Pen className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">签名模式</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-stone-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">粗细</span>
            <input
              type="range"
              min="1"
              max="12"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 accent-amber-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium',
              'flex items-center gap-1',
              'bg-stone-100 text-stone-600 hover:bg-stone-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <RotateCcw className="w-3 h-3" />
            撤销
          </button>

          <button
            onClick={clearCanvas}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium',
              'flex items-center gap-1',
              'bg-stone-100 text-stone-600 hover:bg-stone-200',
              'transition-colors'
            )}
          >
            <Eraser className="w-3 h-3" />
            清空
          </button>

          <button
            onClick={saveToPresets}
            disabled={!hasContent}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium',
              'flex items-center gap-1',
              'bg-stone-600 text-white hover:bg-stone-700',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <Save className="w-3 h-3" />
            仅保存预设
          </button>

          <button
            onClick={saveAndPlace}
            disabled={!hasContent}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-bold',
              'flex items-center gap-1',
              'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
              'hover:from-amber-600 hover:to-orange-600',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <Save className="w-3 h-3" />
            完成签名
          </button>

          <button
            onClick={handleClose}
            className={cn(
              'p-1 rounded-md ml-1',
              'text-stone-400 hover:text-stone-600 hover:bg-stone-100',
              'transition-colors'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 z-10',
          'w-full h-full',
          'cursor-crosshair touch-none'
        )}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </>
  )
}
