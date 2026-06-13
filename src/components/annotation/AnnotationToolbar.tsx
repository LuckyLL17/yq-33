import { useCallback } from 'react'
import {
  Pencil,
  Highlighter,
  Circle,
  Square,
  Minus,
  Underline,
  ArrowRight,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Save,
  X,
  Minus as WaveSine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { AnnotationTool } from '@/store/useWorkspaceStore'

const COLORS = [
  '#e53935',
  '#1e88e5',
  '#43a047',
  '#fb8c00',
  '#8e24aa',
  '#000000',
  '#ffffff',
  '#ffeb3b',
]

interface ToolConfig {
  id: AnnotationTool
  label: string
  icon: typeof Pencil
}

const TOOLS: ToolConfig[] = [
  { id: 'pen', label: '画笔', icon: Pencil },
  { id: 'highlighter', label: '荧光笔', icon: Highlighter },
  { id: 'circle', label: '圆圈', icon: Circle },
  { id: 'rect', label: '方框', icon: Square },
  { id: 'line', label: '直线', icon: Minus },
  { id: 'arrow', label: '箭头', icon: ArrowRight },
  { id: 'underline', label: '下划线', icon: Underline },
  { id: 'wavy', label: '波浪线', icon: WaveSine },
  { id: 'text', label: '文字', icon: Type },
  { id: 'eraser', label: '擦除', icon: Eraser },
]

interface AnnotationToolbarProps {
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onClearPage: () => void
  onSavePreset?: () => void
  onClose: () => void
}

export default function AnnotationToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearPage,
  onSavePreset,
  onClose,
}: AnnotationToolbarProps) {
  const {
    activeAnnotationTool,
    setActiveAnnotationTool,
    annotationStyle,
    setAnnotationStyle,
    annotationPresets,
    setActiveAnnotationTool: setTool,
    setAnnotationStyle: setStyle,
  } = useWorkspaceStore()

  const handleToolChange = useCallback(
    (tool: AnnotationTool) => {
      setActiveAnnotationTool(tool)
      if (tool === 'highlighter') {
        setAnnotationStyle({ strokeWidth: 14, opacity: 0.5 })
      } else if (tool === 'eraser') {
        setAnnotationStyle({ strokeWidth: 20, opacity: 1 })
      } else if (tool === 'text') {
        setAnnotationStyle({ strokeWidth: 1, opacity: 1 })
      }
    },
    [setActiveAnnotationTool, setAnnotationStyle]
  )

  const handleColorChange = useCallback(
    (color: string) => {
      setAnnotationStyle({ color })
    },
    [setAnnotationStyle]
  )

  const handleStrokeWidthChange = useCallback(
    (width: number) => {
      setAnnotationStyle({ strokeWidth: width })
    },
    [setAnnotationStyle]
  )

  const handleOpacityChange = useCallback(
    (opacity: number) => {
      setAnnotationStyle({ opacity })
    },
    [setAnnotationStyle]
  )

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = annotationPresets.find((p) => p.id === presetId)
      if (preset) {
        setTool(preset.tool)
        setStyle(preset.style)
      }
    },
    [annotationPresets, setTool, setStyle]
  )

  return (
    <div
      className={cn(
        'absolute z-20',
        'top-0 left-0 right-0',
        'flex items-center justify-between flex-wrap',
        'px-4 py-2.5 gap-2',
        'bg-white/95 backdrop-blur-sm',
        'border-b border-rose-300',
        'shadow-md shadow-rose-900/10'
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-100 border border-rose-200">
          <Pencil className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-xs font-bold text-rose-700">批注模式</span>
        </div>

        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-stone-100 border border-stone-200">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            const isActive = activeAnnotationTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                title={tool.label}
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm'
                    : 'text-stone-500 hover:text-rose-700 hover:bg-white'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stone-100 border border-stone-200">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              title={color}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                annotationStyle.color === color
                  ? 'border-stone-700 scale-110 shadow-md'
                  : 'border-white hover:scale-105'
              )}
              style={{
                backgroundColor: color,
                boxShadow: color === '#ffffff' ? '0 0 0 1px #d4d4d4' : undefined,
              }}
            />
          ))}
          <label className="relative w-6 h-6 rounded-full overflow-hidden cursor-pointer border border-stone-300 hover:scale-105 transition-transform">
            <input
              type="color"
              value={annotationStyle.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
            />
          </label>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-stone-100 border border-stone-200">
          <span className="text-xs text-stone-500">粗细</span>
          <input
            type="range"
            min="1"
            max={activeAnnotationTool === 'highlighter' || activeAnnotationTool === 'eraser' ? 40 : 12}
            value={annotationStyle.strokeWidth}
            onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
            className="w-16 accent-rose-600"
          />
          <span className="text-xs font-mono text-stone-600 w-6">
            {annotationStyle.strokeWidth}
          </span>
        </div>

        {(activeAnnotationTool === 'highlighter' || activeAnnotationTool === 'text') && (
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-stone-100 border border-stone-200">
            <span className="text-xs text-stone-500">
              {activeAnnotationTool === 'highlighter' ? '透明度' : '字号'}
            </span>
            <input
              type="range"
              min={activeAnnotationTool === 'highlighter' ? 10 : 12}
              max={activeAnnotationTool === 'highlighter' ? 100 : 60}
              value={
                activeAnnotationTool === 'highlighter'
                  ? Math.round(annotationStyle.opacity * 100)
                  : annotationStyle.fontSize || 20
              }
              onChange={(e) => {
                const v = Number(e.target.value)
                if (activeAnnotationTool === 'highlighter') {
                  handleOpacityChange(v / 100)
                } else {
                  setAnnotationStyle({ fontSize: v })
                }
              }}
              className="w-16 accent-rose-600"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {annotationPresets.length > 0 && (
          <select
            onChange={(e) => applyPreset(e.target.value)}
            value=""
            className="h-7 px-2 rounded-md text-xs border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">快速样式</option>
            {annotationPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center',
            'bg-stone-100 text-stone-600 hover:bg-stone-200',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          title="撤销"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center',
            'bg-stone-100 text-stone-600 hover:bg-stone-200',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          title="重做"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClearPage}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium',
            'flex items-center gap-1',
            'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600',
            'transition-colors'
          )}
          title="清除本页"
        >
          <Trash2 className="w-3 h-3" />
          清除本页
        </button>

        {onSavePreset && (
          <button
            onClick={onSavePreset}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium',
              'flex items-center gap-1',
              'bg-stone-600 text-white hover:bg-stone-700',
              'transition-colors'
            )}
            title="保存当前样式"
          >
            <Save className="w-3 h-3" />
            保存样式
          </button>
        )}

        <button
          onClick={onClose}
          className={cn(
            'px-3 py-1 rounded-md text-xs font-bold',
            'flex items-center gap-1',
            'bg-gradient-to-r from-rose-500 to-orange-500 text-white',
            'hover:from-rose-600 hover:to-orange-600',
            'transition-colors'
          )}
        >
          <Save className="w-3 h-3" />
          完成批注
        </button>

        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded-md',
            'text-stone-400 hover:text-stone-600 hover:bg-stone-100',
            'transition-colors'
          )}
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
