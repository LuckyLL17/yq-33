import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, RotateCcw, Pen, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { paperPresets } from '@/constants/presets'
import { getSignatureBounds, extractSignatureDataUrl } from '@/utils/signatureRenderer'

interface DirectSignatureOverlayProps {
  onClose: () => void
}

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

export default function DirectSignatureOverlay({ onClose }: DirectSignatureOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#3a2e1f')
  const [hasContent, setHasContent] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])

  const addSignature = useWorkspaceStore((s) => s.addSignature)
  const addSignaturePlacement = useWorkspaceStore((s) => s.addSignaturePlacement)
  const currentPage = useWorkspaceStore((s) => s.currentPage)
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

    canvas.width = PAGE_WIDTH * 2
    canvas.height = PAGE_HEIGHT * 2
    canvas.style.width = `${PAGE_WIDTH}px`
    canvas.style.height = `${PAGE_HEIGHT}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(2, 2)

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
    const ctx = canvas.getContext('2d')
    if (!ctx) return { x: PAGE_WIDTH / 2, y: PAGE_HEIGHT / 2 }

    const bounds = getSignatureBounds(canvas, false)
    const logicalBounds = {
      left: bounds.left / 2,
      top: bounds.top / 2,
      right: bounds.right / 2,
      bottom: bounds.bottom / 2,
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
    const { dataUrl, width, height } = extractSignatureDataUrl(
      canvas,
      bounds,
      10,
      false
    )

    if (width <= 20 || height <= 20) return

    const name = `签名 ${useWorkspaceStore.getState().signatures.length + 1}`
    const pi = getPaperInfo()

    const tempSig = {
      name,
      dataUrl,
      width: width / 2,
      height: height / 2,
      bgOpacity: 0,
      paperId: selectedPaperId,
      paperBgColor: pi.paperBgColor,
      paperLineColor: pi.paperLineColor,
      paperLineSpacing: pi.paperLineSpacing,
      paperType: pi.paperType,
    }

    const tempId = `sig_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const state = useWorkspaceStore.getState()
    const newSignatures = [
      ...state.signatures,
      { ...tempSig, id: tempId, createdAt: Date.now() },
    ]
    useWorkspaceStore.setState({ signatures: newSignatures })

    const center = getCenterPoint(canvas)
    const placement = {
      signatureId: tempId,
      pageIndex: currentPage - 1,
      x: center.x,
      y: center.y,
      scale: 1,
    }

    const newPlacements = [...state.signaturePlacements, placement]
    useWorkspaceStore.setState({
      signaturePlacements: newPlacements,
      isPlacingSignature: false,
      selectedSignatureId: null,
    })

    onClose()
  }

  const saveToPresets = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasContent) return

    const bounds = getSignatureBounds(canvas, false)
    const { dataUrl, width, height } = extractSignatureDataUrl(
      canvas,
      bounds,
      10,
      false
    )

    if (width <= 20 || height <= 20) return

    const name = `签名 ${useWorkspaceStore.getState().signatures.length + 1}`
    const pi = getPaperInfo()

    addSignature({
      name,
      dataUrl,
      width: width / 2,
      height: height / 2,
      bgOpacity: 0,
      paperId: selectedPaperId,
      paperBgColor: pi.paperBgColor,
      paperLineColor: pi.paperLineColor,
      paperLineSpacing: pi.paperLineSpacing,
      paperType: pi.paperType,
    })

    onClose()
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex flex-col gap-3">
        <div
          className={cn(
            'flex items-center justify-between',
            'px-4 py-2.5 rounded-xl',
            'bg-white shadow-lg shadow-stone-900/20',
            'border border-stone-200'
          )}
        >
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-stone-700">在信纸上签名</h3>
            <div className="flex items-center gap-2">
              <Pen className="w-4 h-4 text-stone-500" />
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
                className="w-20 accent-amber-600"
              />
              <span className="text-xs text-stone-400 w-4">{brushSize}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'flex items-center gap-1',
                'bg-stone-100 text-stone-600 hover:bg-stone-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              撤销
            </button>

            <button
              onClick={clearCanvas}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'flex items-center gap-1',
                'bg-stone-100 text-stone-600 hover:bg-stone-200',
                'transition-colors'
              )}
            >
              <Eraser className="w-3.5 h-3.5" />
              清空
            </button>

            <button
              onClick={saveToPresets}
              disabled={!hasContent}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'flex items-center gap-1',
                'bg-stone-600 text-white hover:bg-stone-700',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <Save className="w-3.5 h-3.5" />
              仅保存预设
            </button>

            <button
              onClick={saveAndPlace}
              disabled={!hasContent}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'flex items-center gap-1',
                'bg-amber-500 text-white hover:bg-amber-600',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <Save className="w-3.5 h-3.5" />
              保存并插入
            </button>

            <button
              onClick={onClose}
              className={cn(
                'p-1.5 rounded-lg',
                'text-stone-400 hover:text-stone-600 hover:bg-stone-100',
                'transition-colors'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            'relative rounded-sm overflow-hidden',
            'cursor-crosshair touch-none',
            'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]'
          )}
          style={{
            width: `${PAGE_WIDTH}px`,
            height: `${PAGE_HEIGHT}px`,
            boxShadow: `
              0 1px 1px rgba(0,0,0,0.12),
              0 2px 2px rgba(0,0,0,0.12),
              0 4px 4px rgba(0,0,0,0.12),
              0 8px 8px rgba(0,0,0,0.12),
              0 16px 16px rgba(0,0,0,0.12),
              0 32px 32px rgba(0,0,0,0.18)
            `,
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <p className="text-xs text-white/80 text-center">
          在信纸上直接书写签名，选择「保存并插入」添加到当前位置，或「仅保存预设」添加到签名库
        </p>
      </div>
    </div>
  )
}
