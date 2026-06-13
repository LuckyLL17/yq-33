import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, RotateCcw, Pen, Save, X, FileText, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { paperPresets } from '@/constants/presets'
import type { PaperType } from '@/types'

interface SignatureCanvasProps {
  onClose?: () => void
}

export default function SignatureCanvas({ onClose }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(3)
  const [brushColor, setBrushColor] = useState('#3a2e1f')
  const [hasContent, setHasContent] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])
  const [bgMode, setBgMode] = useState<'white' | 'paper'>('paper')
  const [bgOpacity, setBgOpacity] = useState(0)
  const addSignature = useWorkspaceStore((s) => s.addSignature)
  const { selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing, showBindingLine } = useWorkspaceStore()

  const getPaperState = useCallback(() => {
    const paper = paperPresets.find((p) => p.id === selectedPaperId) || paperPresets[0]
    const typeMap: Record<string, PaperType> = {
      blank: 'blank', line: 'line', grid: 'grid', squared: 'grid',
      notebook: 'line', kraft: 'kraft', newspaper: 'blank', dotted: 'dotted',
    }
    return {
      pageWidth: 600,
      pageHeight: 200,
      paperBgColor: paperBgColor || paper.bgColor,
      paperLineColor: paperLineColor || paper.lineColor,
      paperLineSpacing: paperLineSpacing || paper.lineSpacing,
      paperType: typeMap[selectedPaperId] || 'line',
      showMargin: false,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
    }
  }, [selectedPaperId, paperBgColor, paperLineColor, paperLineSpacing])

  const drawPaperBackground = useCallback((ctx: CanvasRenderingContext2D, opacity: number) => {
    const rs = getPaperState()
    const { pageWidth, pageHeight, paperType, paperBgColor, paperLineColor, paperLineSpacing, marginTop, marginBottom, marginLeft, marginRight } = rs

    ctx.globalAlpha = opacity

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

    ctx.globalAlpha = 1
  }, [getPaperState])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (bgMode === 'white') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      drawPaperBackground(ctx, bgOpacity > 0 ? 1 : 0.3)
    }
  }, [bgMode, bgOpacity, drawPaperBackground])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 600
    canvas.height = 200

    redrawCanvas()

    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasContent) {
      redrawCanvas()
    }
  }, [bgMode, bgOpacity, redrawCanvas, hasContent])

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
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

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
    redrawCanvas()
    setHasContent(false)
  }

  const undo = () => {
    if (history.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lastState = history[history.length - 1]
    ctx.putImageData(lastState, 0, 0)
    setHistory((prev) => prev.slice(0, -1))

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasPixels = imageData.data.some((pixel, i) => i % 4 === 3 && pixel !== 255 && pixel !== 0)
    setHasContent(hasPixels)
  }

  const getSignatureBounds = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return { left: 0, top: 0, right: 0, bottom: 0 }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let left = canvas.width
    let top = canvas.height
    let right = 0
    let bottom = 0

    const bgR = bgMode === 'white' ? 255 : 0
    const bgG = bgMode === 'white' ? 255 : 0
    const bgB = bgMode === 'white' ? 255 : 0

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const a = data[idx + 3]

        const isNotBg = Math.abs(r - bgR) > 30 || Math.abs(g - bgG) > 30 || Math.abs(b - bgB) > 30

        if (a > 50 && isNotBg) {
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
    }

    if (right === 0) {
      return { left: 0, top: 0, right: canvas.width, bottom: canvas.height }
    }

    return { left, top, right, bottom }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasContent) return

    const { left, top, right, bottom } = getSignatureBounds(canvas)
    const width = right - left + 20
    const height = bottom - top + 20

    if (width <= 20 || height <= 20) return

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCtx.clearRect(0, 0, width, height)
    tempCtx.drawImage(canvas, left - 10, top - 10, width, height, 0, 0, width, height)

    const imageData = tempCtx.getImageData(0, 0, width, height)
    const data = imageData.data

    const bgR = bgMode === 'white' ? 255 : 0
    const bgG = bgMode === 'white' ? 255 : 0
    const bgB = bgMode === 'white' ? 255 : 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const isBg = Math.abs(r - bgR) <= 30 && Math.abs(g - bgG) <= 30 && Math.abs(b - bgB) <= 30
      if (isBg) {
        data[i + 3] = 0
      }
    }

    tempCtx.putImageData(imageData, 0, 0)

    const dataUrl = tempCanvas.toDataURL('image/png')
    const name = `签名 ${useWorkspaceStore.getState().signatures.length + 1}`
    const ps = getPaperState()

    addSignature({
      name,
      dataUrl,
      width,
      height,
      bgOpacity,
      paperId: selectedPaperId,
      paperBgColor: ps.paperBgColor,
      paperLineColor: ps.paperLineColor,
      paperLineSpacing: ps.paperLineSpacing,
      paperType: ps.paperType,
    })

    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-700">手写签名</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        className={cn(
          'relative rounded-xl overflow-hidden border-2 border-stone-200',
          'cursor-crosshair touch-none'
        )}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-48 block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
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
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-amber-600"
          />
          <span className="text-xs text-stone-400 w-4">{brushSize}</span>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
          <button
            onClick={() => setBgMode('white')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all',
              bgMode === 'white'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <Square className="w-3 h-3" />
            纯白
          </button>
          <button
            onClick={() => setBgMode('paper')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all',
              bgMode === 'paper'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            <FileText className="w-3 h-3" />
            信纸
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">背景</span>
          <input
            type="range"
            min="0"
            max="100"
            value={bgOpacity * 100}
            onChange={(e) => setBgOpacity(Number(e.target.value) / 100)}
            className="w-20 accent-amber-600"
          />
          <span className="text-xs text-stone-400 w-8">{Math.round(bgOpacity * 100)}%</span>
        </div>

        <div className="flex items-center gap-1 ml-auto">
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
            onClick={saveSignature}
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
            保存
          </button>
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center">
        {bgMode === 'paper'
          ? '在信纸上书写签名，调整背景透明度（0%为无背景），然后保存'
          : '在白底画布上书写签名，调整背景透明度（0%为无背景），然后保存'}
      </p>
    </div>
  )
}
