import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Trash2, RotateCcw, ZoomIn, X, Move } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { decorationPresets } from '@/constants/decorationPresets'
import type { DecorationPlacement } from '@/types'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123

type InteractionMode = 'none' | 'drag' | 'resize' | 'rotate'

interface InteractionState {
  mode: InteractionMode
  placementId: string | null
  startX: number
  startY: number
  origX: number
  origY: number
  origWidth: number
  origHeight: number
  origRotation: number
  aspectRatio: number
}

export default function DecorationOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)

  const {
    decorationPlacements,
    currentPage,
    selectedDecorationPlacementId,
    setSelectedDecorationPlacementId,
    updateDecorationPlacement,
    deleteDecorationPlacement,
    setIsPlacingDecoration,
    setSelectedDecorationId,
    selectedDecorationId,
    addDecorationPlacement,
    isPlacingDecoration,
  } = useWorkspaceStore()

  const [interaction, setInteraction] = useState<InteractionState>({
    mode: 'none',
    placementId: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origWidth: 0,
    origHeight: 0,
    origRotation: 0,
    aspectRatio: 1,
  })

  const currentPageIdx = currentPage - 1
  const pagePlacements = useMemo(
    () => decorationPlacements.filter((d) => d.pageIndex === currentPageIdx),
    [decorationPlacements, currentPageIdx]
  )

  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const overlay = overlayRef.current
      if (!overlay) return { x: 0, y: 0 }

      const rect = overlay.getBoundingClientRect()
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

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isPlacingDecoration || !selectedDecorationId) return
      const pos = getPosition(e)
      const preset = decorationPresets.find((p) => p.id === selectedDecorationId)
      if (!preset) return

      addDecorationPlacement({
        decorationId: selectedDecorationId,
        pageIndex: currentPageIdx,
        x: pos.x,
        y: pos.y,
        width: preset.defaultWidth,
        height: preset.defaultHeight,
        rotation: 0,
        opacity: 1,
      })
    },
    [isPlacingDecoration, selectedDecorationId, currentPageIdx, getPosition, addDecorationPlacement]
  )

  const startDrag = useCallback(
    (e: React.MouseEvent, placement: DecorationPlacement) => {
      e.stopPropagation()
      const pos = getPosition(e)
      setSelectedDecorationPlacementId(placement.id)
      setInteraction({
        mode: 'drag',
        placementId: placement.id,
        startX: pos.x,
        startY: pos.y,
        origX: placement.x,
        origY: placement.y,
        origWidth: placement.width,
        origHeight: placement.height,
        origRotation: placement.rotation,
        aspectRatio: placement.width / placement.height,
      })
    },
    [getPosition, setSelectedDecorationPlacementId]
  )

  const startResize = useCallback(
    (e: React.MouseEvent, placement: DecorationPlacement) => {
      e.stopPropagation()
      const pos = getPosition(e)
      setSelectedDecorationPlacementId(placement.id)
      setInteraction({
        mode: 'resize',
        placementId: placement.id,
        startX: pos.x,
        startY: pos.y,
        origX: placement.x,
        origY: placement.y,
        origWidth: placement.width,
        origHeight: placement.height,
        origRotation: placement.rotation,
        aspectRatio: placement.width / placement.height,
      })
    },
    [getPosition, setSelectedDecorationPlacementId]
  )

  const startRotate = useCallback(
    (e: React.MouseEvent, placement: DecorationPlacement) => {
      e.stopPropagation()
      const pos = getPosition(e)
      setSelectedDecorationPlacementId(placement.id)
      setInteraction({
        mode: 'rotate',
        placementId: placement.id,
        startX: pos.x,
        startY: pos.y,
        origX: placement.x,
        origY: placement.y,
        origWidth: placement.width,
        origHeight: placement.height,
        origRotation: placement.rotation,
        aspectRatio: placement.width / placement.height,
      })
    },
    [getPosition, setSelectedDecorationPlacementId]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (interaction.mode === 'none' || !interaction.placementId) return
      const pos = getPosition(e)
      const dx = pos.x - interaction.startX
      const dy = pos.y - interaction.startY

      if (interaction.mode === 'drag') {
        updateDecorationPlacement(interaction.placementId, {
          x: interaction.origX + dx,
          y: interaction.origY + dy,
        })
      } else if (interaction.mode === 'resize') {
        const shiftKey = (e as React.MouseEvent).shiftKey
        const dist = Math.hypot(dx, dy)
        const scale = 1 + dist / 200
        let newWidth = interaction.origWidth * scale
        let newHeight = interaction.origHeight * scale
        if (!shiftKey) {
          newHeight = newWidth / interaction.aspectRatio
        }
        newWidth = Math.max(20, newWidth)
        newHeight = Math.max(20, newHeight)
        updateDecorationPlacement(interaction.placementId, {
          width: newWidth,
          height: newHeight,
        })
      } else if (interaction.mode === 'rotate') {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        updateDecorationPlacement(interaction.placementId, {
          rotation: interaction.origRotation + angle,
        })
      }
    },
    [interaction, getPosition, updateDecorationPlacement]
  )

  const handleEnd = useCallback(() => {
    setInteraction((prev) => ({ ...prev, mode: 'none', placementId: null }))
  }, [])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.dataset.overlay === 'true') {
        setSelectedDecorationPlacementId(null)
      }
      if (isPlacingDecoration) {
        handleCanvasClick(e)
      }
    },
    [setSelectedDecorationPlacementId, isPlacingDecoration, handleCanvasClick]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      deleteDecorationPlacement(id)
      if (selectedDecorationPlacementId === id) {
        setSelectedDecorationPlacementId(null)
      }
    },
    [deleteDecorationPlacement, selectedDecorationPlacementId, setSelectedDecorationPlacementId]
  )

  const handleResetRotation = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      updateDecorationPlacement(id, { rotation: 0 })
    },
    [updateDecorationPlacement]
  )

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
      e.stopPropagation()
      updateDecorationPlacement(id, { opacity: Number(e.target.value) })
    },
    [updateDecorationPlacement]
  )

  const cancelPlacement = useCallback(() => {
    setIsPlacingDecoration(false)
    setSelectedDecorationId(null)
  }, [setIsPlacingDecoration, setSelectedDecorationId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelPlacement()
        setSelectedDecorationPlacementId(null)
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDecorationPlacementId) {
          deleteDecorationPlacement(selectedDecorationPlacementId)
          setSelectedDecorationPlacementId(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cancelPlacement, selectedDecorationPlacementId, deleteDecorationPlacement, setSelectedDecorationPlacementId])

  return (
    <div className="absolute inset-0 z-10">
      <div
        className={cn(
          'h-11 shrink-0',
          'flex items-center justify-between',
          'px-3',
          'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
        )}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <span className="text-xs font-bold">装饰编辑</span>
          {isPlacingDecoration && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">点击信纸放置装饰</span>
          )}
          {selectedDecorationPlacementId && !isPlacingDecoration && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">拖动移动，角落缩放</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPlacingDecoration && (
            <button
              onClick={cancelPlacement}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title="取消放置"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={overlayRef}
        data-overlay="true"
        className={cn(
          'absolute inset-0 top-11',
          'cursor-default',
          isPlacingDecoration && 'cursor-crosshair'
        )}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onClick={handleOverlayClick}
      >
        {pagePlacements.map((placement) => {
          const preset = decorationPresets.find((p) => p.id === placement.decorationId)
          if (!preset) return null
          const isSelected = selectedDecorationPlacementId === placement.id

          return (
            <div
              key={placement.id}
              className={cn(
                'absolute',
                isSelected && 'z-20'
              )}
              style={{
                left: `${(placement.x / PAGE_WIDTH) * 100}%`,
                top: `${(placement.y / PAGE_HEIGHT) * 100}%`,
                width: `${(placement.width / PAGE_WIDTH) * 100}%`,
                height: `${(placement.height / PAGE_HEIGHT) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
                opacity: placement.opacity,
              }}
              onMouseDown={(e) => startDrag(e, placement)}
            >
              <div
                className={cn(
                  'w-full h-full',
                  isSelected && 'ring-2 ring-rose-500 ring-offset-1'
                )}
                dangerouslySetInnerHTML={{ __html: preset.svgContent }}
                style={{ pointerEvents: 'none' }}
              />

              {isSelected && (
                <>
                  <div
                    className={cn(
                      'absolute -right-2 -bottom-2',
                      'w-5 h-5 rounded-full',
                      'bg-rose-500 text-white',
                      'flex items-center justify-center',
                      'cursor-nwse-resize shadow-md',
                      'hover:bg-rose-600 transition-colors'
                    )}
                    onMouseDown={(e) => startResize(e, placement)}
                    title="拖动缩放 (Shift 自由缩放)"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </div>

                  <div
                    className={cn(
                      'absolute -right-2 -top-2',
                      'w-5 h-5 rounded-full',
                      'bg-amber-500 text-white',
                      'flex items-center justify-center',
                      'cursor-grab shadow-md',
                      'hover:bg-amber-600 transition-colors'
                    )}
                    onMouseDown={(e) => startRotate(e, placement)}
                    title="拖动旋转"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </div>

                  <div
                    className={cn(
                      'absolute -left-2 -top-2',
                      'w-5 h-5 rounded-full',
                      'bg-stone-500 text-white',
                      'flex items-center justify-center',
                      'cursor-pointer shadow-md',
                      'hover:bg-stone-600 transition-colors'
                    )}
                    onClick={(e) => handleResetRotation(e, placement.id)}
                    title="重置旋转"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </div>

                  <div
                    className={cn(
                      'absolute -left-2 -bottom-2',
                      'w-5 h-5 rounded-full',
                      'bg-red-500 text-white',
                      'flex items-center justify-center',
                      'cursor-pointer shadow-md',
                      'hover:bg-red-600 transition-colors'
                    )}
                    onClick={(e) => handleDelete(e, placement.id)}
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </div>

                  <div
                    className={cn(
                      'absolute left-1/2 -bottom-8',
                      '-translate-x-1/2',
                      'bg-white rounded-lg shadow-lg border border-stone-200',
                      'px-2 py-1',
                      'flex items-center gap-1.5'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-stone-500">透明度</span>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={placement.opacity}
                      onChange={(e) => handleOpacityChange(e, placement.id)}
                      className="w-16 h-1.5 accent-rose-500"
                    />
                    <span className="text-[10px] font-medium text-stone-600 w-8">
                      {Math.round(placement.opacity * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
