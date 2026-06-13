import { forwardRef, useCallback, useRef } from 'react'
import { ZoomOut, ZoomIn, ChevronLeft, ChevronRight, X, PenTool, ListPlus, Layers, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useHandwritingRender } from '@/hooks/useHandwritingRender'
import DirectSignatureOverlay from '@/components/signature/DirectSignatureOverlay'
import AnnotationOverlay from '@/components/annotation/AnnotationOverlay'
import DecorationOverlay from '@/components/decoration/DecorationOverlay'

interface HandwritingPreviewProps {}

const HandwritingPreview = forwardRef<HTMLCanvasElement, HandwritingPreviewProps>(
  (_props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const {
      zoomLevel,
      setZoomLevel,
      currentPage,
      setCurrentPage,
      totalPages,
      isPlacingSignature,
      selectedSignatureId,
      signatures,
      addSignaturePlacement,
      setIsPlacingSignature,
      setSelectedSignatureId,
      isDirectSigning,
      setIsDirectSigning,
      isPlacingStamp,
      selectedStampId,
      stamps,
      addStampPlacement,
      setIsPlacingStamp,
      setSelectedStampId,
      isAnnotating,
      setIsAnnotating,
      isPlacingDecoration,
      selectedDecorationId,
      setIsPlacingDecoration,
      setSelectedDecorationId,
      decorationCategory,
      setDecorationCategory,
      activeFilter,
      setActiveTab,
      decorationPlacements,
    } = useWorkspaceStore()
    const { canvasRef, pageSize } = useHandwritingRender({
      externalCanvasRef: ref as React.RefObject<HTMLCanvasElement>,
    })

    const selectedSignature = signatures.find((s) => s.id === selectedSignatureId)
    const selectedStamp = stamps.find((s) => s.id === selectedStampId)

    const handleZoomOut = useCallback(() => {
      setZoomLevel(Math.max(0.25, zoomLevel - 0.1))
    }, [zoomLevel, setZoomLevel])

    const handleZoomIn = useCallback(() => {
      setZoomLevel(Math.min(3, zoomLevel + 0.1))
    }, [zoomLevel, setZoomLevel])

    const handleZoomReset = useCallback(() => {
      setZoomLevel(1)
    }, [setZoomLevel])

    const handlePrevPage = useCallback(() => {
      setCurrentPage(currentPage - 1)
    }, [currentPage, setCurrentPage])

    const handleNextPage = useCallback(() => {
      setCurrentPage(currentPage + 1)
    }, [currentPage, setCurrentPage])

    const handleCanvasClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPlacingSignature && selectedSignatureId) {
          const canvas = canvasRef.current
          if (!canvas) return

          const rect = canvas.getBoundingClientRect()
          const scaleX = pageSize.width / rect.width
          const scaleY = pageSize.height / rect.height

          const x = (e.clientX - rect.left) * scaleX
          const y = (e.clientY - rect.top) * scaleY

          addSignaturePlacement({
            signatureId: selectedSignatureId,
            pageIndex: currentPage - 1,
            x,
            y,
            scale: 1,
          })
          return
        }

        if (isPlacingStamp && selectedStampId) {
          const canvas = canvasRef.current
          if (!canvas) return

          const rect = canvas.getBoundingClientRect()
          const scaleX = pageSize.width / rect.width
          const scaleY = pageSize.height / rect.height

          const x = (e.clientX - rect.left) * scaleX
          const y = (e.clientY - rect.top) * scaleY

          addStampPlacement({
            stampId: selectedStampId,
            pageIndex: currentPage - 1,
            x,
            y,
            scale: 1,
          })
        }
      },
      [isPlacingSignature, selectedSignatureId, isPlacingStamp, selectedStampId, canvasRef, pageSize, currentPage, addSignaturePlacement, addStampPlacement]
    )

    const cancelPlacement = useCallback(() => {
      setIsPlacingSignature(false)
      setSelectedSignatureId(null)
      setIsPlacingStamp(false)
      setSelectedStampId(null)
      setIsPlacingDecoration(false)
      setSelectedDecorationId(null)
    }, [setIsPlacingSignature, setSelectedSignatureId, setIsPlacingStamp, setSelectedStampId, setIsPlacingDecoration, setSelectedDecorationId])

    const handleDirectSign = useCallback(() => {
      setIsPlacingSignature(false)
      setSelectedSignatureId(null)
      setIsPlacingStamp(false)
      setSelectedStampId(null)
      setIsAnnotating(false)
      setIsPlacingDecoration(false)
      setSelectedDecorationId(null)
      setIsDirectSigning(true)
    }, [setIsDirectSigning, setIsPlacingSignature, setSelectedSignatureId, setIsPlacingStamp, setSelectedStampId, setIsAnnotating, setIsPlacingDecoration, setSelectedDecorationId])

    const handleStartAnnotation = useCallback(() => {
      setIsPlacingSignature(false)
      setSelectedSignatureId(null)
      setIsPlacingStamp(false)
      setSelectedStampId(null)
      setIsDirectSigning(false)
      setIsPlacingDecoration(false)
      setSelectedDecorationId(null)
      setIsAnnotating(true)
    }, [setIsAnnotating, setIsPlacingSignature, setSelectedSignatureId, setIsPlacingStamp, setSelectedStampId, setIsDirectSigning, setIsPlacingDecoration, setSelectedDecorationId])

    const handleStartDecoration = useCallback(() => {
      setIsPlacingSignature(false)
      setSelectedSignatureId(null)
      setIsPlacingStamp(false)
      setSelectedStampId(null)
      setIsDirectSigning(false)
      setIsAnnotating(false)
      setActiveTab('decoration')
    }, [setIsPlacingSignature, setSelectedSignatureId, setIsPlacingStamp, setSelectedStampId, setIsDirectSigning, setIsAnnotating, setActiveTab])

    const handleFilterShortcut = useCallback(() => {
      setActiveTab('filter')
    }, [setActiveTab])

    return (
      <div className={cn('flex-1 min-h-0 flex flex-col', 'p-4 gap-3')}>
        <div
          className={cn(
            'h-11 shrink-0',
            'flex items-center justify-between',
            'px-3 rounded-xl',
            'bg-white border border-stone-200',
            'shadow-sm'
          )}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-stone-600 mr-2">缩放</span>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
              className={cn(
                'w-8 h-8 rounded-lg',
                'flex items-center justify-center',
                'text-stone-600 hover:text-amber-700',
                'hover:bg-amber-50',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                'transition-all duration-200'
              )}
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className={cn(
                'h-8 px-3 rounded-lg',
                'text-xs font-bold',
                'text-amber-700 bg-amber-50',
                'border border-amber-200',
                'hover:bg-amber-100',
                'transition-all duration-200'
              )}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className={cn(
                'w-8 h-8 rounded-lg',
                'flex items-center justify-center',
                'text-stone-600 hover:text-amber-700',
                'hover:bg-amber-50',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                'transition-all duration-200'
              )}
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isDirectSigning && !isAnnotating && (
              <button
                onClick={handleFilterShortcut}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  'flex items-center gap-1.5',
                  activeFilter !== 'none'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/30'
                    : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100',
                  'transition-all duration-200'
                )}
              >
                <Wand2 className="w-3.5 h-3.5" />
                {activeFilter !== 'none' ? '滤镜中' : '滤镜效果'}
              </button>
            )}

            {!isDirectSigning && !isAnnotating && (
              <button
                onClick={handleStartDecoration}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  'flex items-center gap-1.5',
                  'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
                  'hover:from-pink-600 hover:to-rose-600',
                  'shadow-sm shadow-pink-500/30',
                  'transition-all duration-200'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                装饰信纸
              </button>
            )}

            {!isDirectSigning && !isAnnotating && (
              <button
                onClick={handleStartAnnotation}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  'flex items-center gap-1.5',
                  'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
                  'hover:from-rose-600 hover:to-pink-600',
                  'shadow-sm shadow-rose-500/30',
                  'transition-all duration-200'
                )}
              >
                <ListPlus className="w-3.5 h-3.5" />
                添加批注
              </button>
            )}

            {!isDirectSigning && !isAnnotating && (
              <button
                onClick={handleDirectSign}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  'flex items-center gap-1.5',
                  'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                  'hover:from-amber-600 hover:to-orange-600',
                  'shadow-sm shadow-amber-500/30',
                  'transition-all duration-200'
                )}
              >
                <PenTool className="w-3.5 h-3.5" />
                在信纸上签名
              </button>
            )}

            {(isPlacingSignature && selectedSignature) || (isPlacingStamp && selectedStamp) || (isPlacingDecoration && selectedDecorationId) ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-300">
                <span className="text-xs font-medium text-amber-700">
                  {(isPlacingStamp && selectedStamp)
                    ? '点击文档放置印章'
                    : (isPlacingDecoration && selectedDecorationId)
                      ? '点击文档放置装饰'
                      : '点击文档放置签名'}
                </span>
                <button
                  onClick={cancelPlacement}
                  className="p-0.5 rounded text-amber-600 hover:bg-amber-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : !isDirectSigning ? (
              <div
                className={cn(
                  'flex items-center gap-1',
                  'px-2 py-1 rounded-lg',
                  'bg-stone-50 border border-stone-200'
                )}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className={cn(
                    'w-7 h-7 rounded-md',
                    'flex items-center justify-center',
                    'text-stone-600 hover:text-amber-700',
                    'hover:bg-white',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    'transition-all duration-200'
                  )}
                  title="上一页"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-xs font-bold text-amber-700 min-w-[20px] text-center">
                    {currentPage}
                  </span>
                  <span className="text-xs text-stone-400">/</span>
                  <span className="text-xs font-medium text-stone-600 min-w-[20px] text-center">
                    {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'w-7 h-7 rounded-md',
                    'flex items-center justify-center',
                    'text-stone-600 hover:text-amber-700',
                    'hover:bg-white',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    'transition-all duration-200'
                  )}
                  title="下一页"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={containerRef}
          className={cn(
            'flex-1 min-h-0',
            'relative overflow-auto',
            'rounded-2xl',
            'bg-stone-200/50',
            'border border-stone-200'
          )}
          style={{
            backgroundImage: `
              linear-gradient(45deg, #e7e5e4 25%, transparent 25%),
              linear-gradient(-45deg, #e7e5e4 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e7e5e4 75%),
              linear-gradient(-45deg, transparent 75%, #e7e5e4 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div
              className={cn(
                'relative',
                'transition-transform duration-300 ease-out',
                'origin-center'
              )}
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div
                className={cn(
                  'relative rounded-sm overflow-hidden',
                  (isPlacingSignature || isPlacingStamp || isPlacingDecoration) && 'cursor-crosshair'
                )}
                style={{
                  boxShadow: isDirectSigning
                    ? `0 0 0 2px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.3),
                       0 1px 1px rgba(0,0,0,0.12),
                       0 4px 4px rgba(0,0,0,0.12),
                       0 16px 16px rgba(0,0,0,0.12),
                       0 32px 32px rgba(0,0,0,0.18)`
                    : isAnnotating
                    ? `0 0 0 2px #f43f5e, 0 0 20px rgba(244, 63, 94, 0.3),
                       0 1px 1px rgba(0,0,0,0.12),
                       0 4px 4px rgba(0,0,0,0.12),
                       0 16px 16px rgba(0,0,0,0.12),
                       0 32px 32px rgba(0,0,0,0.18)`
                    : decorationPlacements.length > 0
                    ? `0 0 0 2px #ec4899, 0 0 20px rgba(236, 72, 153, 0.3),
                       0 1px 1px rgba(0,0,0,0.12),
                       0 4px 4px rgba(0,0,0,0.12),
                       0 16px 16px rgba(0,0,0,0.12),
                       0 32px 32px rgba(0,0,0,0.18)`
                    : `
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
                  className="block"
                  onClick={handleCanvasClick}
                />

                {isDirectSigning && (
                  <DirectSignatureOverlay />
                )}

                {isAnnotating && (
                  <AnnotationOverlay />
                )}

                {decorationPlacements.length > 0 && !isDirectSigning && !isAnnotating && (
                  <DecorationOverlay />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

HandwritingPreview.displayName = 'HandwritingPreview'

export default HandwritingPreview
