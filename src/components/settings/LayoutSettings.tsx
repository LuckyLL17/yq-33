import { useState } from 'react'
import {
  Type,
  AlignVerticalSpaceBetween,
  AlignHorizontalSpaceBetween,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

export default function LayoutSettings() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const {
    letterSpacing,
    setLetterSpacing,
    lineHeight,
    setLineHeight,
    paragraphSpacing,
    setParagraphSpacing,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    setMargins,
  } = useWorkspaceStore()

  return (
    <div className="p-5 space-y-6">
      <div
        className={cn(
          'p-4 rounded-xl',
          'bg-gradient-to-br from-stone-50 to-amber-50/40',
          'border border-stone-200'
        )}
      >
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={cn(
                  'text-sm font-semibold text-stone-700',
                  'flex items-center gap-1.5'
                )}
              >
                <AlignHorizontalSpaceBetween className="w-3.5 h-3.5 text-amber-600" />
                字间距
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {letterSpacing > 0 ? '+' : ''}
                {letterSpacing}px
              </span>
            </div>
            <input
              type="range"
              min={-2}
              max={10}
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className={cn(
                'w-full h-2 rounded-full appearance-none cursor-pointer',
                'bg-gradient-to-r from-amber-200 to-orange-200',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:bg-gradient-to-br',
                '[&::-webkit-slider-thumb]:from-amber-500 [&::-webkit-slider-thumb]:to-orange-600',
                '[&::-webkit-slider-thumb]:shadow-md',
                '[&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:transition-transform',
                '[&::-webkit-slider-thumb]:hover:scale-110'
              )}
            />
            <div className="flex justify-between mt-1 text-[10px] text-stone-400 font-medium">
              <span>-2</span>
              <span>4</span>
              <span>10</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={cn(
                  'text-sm font-semibold text-stone-700',
                  'flex items-center gap-1.5'
                )}
              >
                <AlignVerticalSpaceBetween className="w-3.5 h-3.5 text-amber-600" />
                行高
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {lineHeight.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={1.2}
              max={3}
              step={0.1}
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className={cn(
                'w-full h-2 rounded-full appearance-none cursor-pointer',
                'bg-gradient-to-r from-amber-200 to-orange-200',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:bg-gradient-to-br',
                '[&::-webkit-slider-thumb]:from-amber-500 [&::-webkit-slider-thumb]:to-orange-600',
                '[&::-webkit-slider-thumb]:shadow-md',
                '[&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:transition-transform',
                '[&::-webkit-slider-thumb]:hover:scale-110'
              )}
            />
            <div className="flex justify-between mt-1 text-[10px] text-stone-400 font-medium">
              <span>紧凑</span>
              <span>适中</span>
              <span>宽松</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={cn(
                  'text-sm font-semibold text-stone-700',
                  'flex items-center gap-1.5'
                )}
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-amber-600" />
                段间距
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {paragraphSpacing}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              value={paragraphSpacing}
              onChange={(e) => setParagraphSpacing(Number(e.target.value))}
              className={cn(
                'w-full h-2 rounded-full appearance-none cursor-pointer',
                'bg-gradient-to-r from-amber-200 to-orange-200',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:bg-gradient-to-br',
                '[&::-webkit-slider-thumb]:from-amber-500 [&::-webkit-slider-thumb]:to-orange-600',
                '[&::-webkit-slider-thumb]:shadow-md',
                '[&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:transition-transform',
                '[&::-webkit-slider-thumb]:hover:scale-110'
              )}
            />
            <div className="flex justify-between mt-1 text-[10px] text-stone-400 font-medium">
              <span>0</span>
              <span>24</span>
              <span>48</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl overflow-hidden',
          'border border-stone-200',
          'bg-gradient-to-br from-stone-50 to-amber-50/40'
        )}
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'w-full flex items-center justify-between',
            'p-4',
            'hover:bg-white/40 transition-colors duration-200'
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-7 h-7 rounded-lg shrink-0',
                'flex items-center justify-center',
                'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600'
              )}
            >
              <Type className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-stone-800 block">页边距</span>
              <span className="text-[11px] text-stone-500">
                上 {marginTop} · 右 {marginRight} · 下 {marginBottom} · 左 {marginLeft}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'w-7 h-7 rounded-lg',
              'flex items-center justify-center',
              'bg-white text-stone-500',
              'border border-stone-200',
              'transition-transform duration-300',
              showAdvanced && 'rotate-180'
            )}
          >
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4">
            <div
              className={cn(
                'p-5 rounded-xl',
                'bg-white/80 border border-stone-200',
                'relative'
              )}
            >
              <div className="relative w-full aspect-square max-w-[220px] mx-auto">
                <div
                  className={cn(
                    'absolute inset-4 rounded-lg',
                    'bg-gradient-to-br from-amber-50 to-orange-50/60',
                    'border-2 border-dashed border-amber-200',
                    'flex items-center justify-center'
                  )}
                >
                  <span className="text-[10px] font-medium text-stone-500">
                    内容区域
                  </span>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <div className="flex flex-col items-center gap-1">
                    <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
                    <input
                      type="number"
                      value={marginTop}
                      onChange={(e) =>
                        setMargins({ top: Number(e.target.value) })
                      }
                      className={cn(
                        'w-14 h-7 text-center text-xs font-bold',
                        'rounded-lg border-2 border-amber-300',
                        'text-amber-800 bg-white',
                        'outline-none focus:ring-2 focus:ring-amber-200',
                        '[appearance:textfield]',
                        '[&::-webkit-inner-spin-button]:appearance-none',
                        '[&::-webkit-outer-spin-button]:appearance-none'
                      )}
                      min={0}
                      max={150}
                    />
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      value={marginBottom}
                      onChange={(e) =>
                        setMargins({ bottom: Number(e.target.value) })
                      }
                      className={cn(
                        'w-14 h-7 text-center text-xs font-bold',
                        'rounded-lg border-2 border-amber-300',
                        'text-amber-800 bg-white',
                        'outline-none focus:ring-2 focus:ring-amber-200',
                        '[appearance:textfield]',
                        '[&::-webkit-inner-spin-button]:appearance-none',
                        '[&::-webkit-outer-spin-button]:appearance-none'
                      )}
                      min={0}
                      max={150}
                    />
                    <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>

                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-600" />
                    <input
                      type="number"
                      value={marginLeft}
                      onChange={(e) =>
                        setMargins({ left: Number(e.target.value) })
                      }
                      className={cn(
                        'w-14 h-7 text-center text-xs font-bold',
                        'rounded-lg border-2 border-amber-300',
                        'text-amber-800 bg-white',
                        'outline-none focus:ring-2 focus:ring-amber-200',
                        '[appearance:textfield]',
                        '[&::-webkit-inner-spin-button]:appearance-none',
                        '[&::-webkit-outer-spin-button]:appearance-none'
                      )}
                      min={0}
                      max={150}
                    />
                  </div>
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      value={marginRight}
                      onChange={(e) =>
                        setMargins({ right: Number(e.target.value) })
                      }
                      className={cn(
                        'w-14 h-7 text-center text-xs font-bold',
                        'rounded-lg border-2 border-amber-300',
                        'text-amber-800 bg-white',
                        'outline-none focus:ring-2 focus:ring-amber-200',
                        '[appearance:textfield]',
                        '[&::-webkit-inner-spin-button]:appearance-none',
                        '[&::-webkit-outer-spin-button]:appearance-none'
                      )}
                      min={0}
                      max={150}
                    />
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
