import { useRef, useEffect } from 'react'
import { Check, StickyNote, Palette, Edit3, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { paperPresets } from '@/constants/presets'

export default function PaperSettings() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    selectedPaperId,
    setSelectedPaperId,
    paperBgColor,
    setPaperBgColor,
    paperLineColor,
    setPaperLineColor,
    paperLineSpacing,
    setPaperLineSpacing,
    showBindingLine,
    setShowBindingLine,
  } = useWorkspaceStore()

  useEffect(() => {
    const preset = paperPresets.find((p) => p.id === selectedPaperId)
    if (preset) {
      setPaperBgColor(preset.bgColor)
      setPaperLineColor(preset.lineColor)
      setPaperLineSpacing(preset.lineSpacing)
    }
  }, [selectedPaperId, setPaperBgColor, setPaperLineColor, setPaperLineSpacing])

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3
          className={cn(
            'text-sm font-bold text-stone-800 mb-3',
            'flex items-center gap-2'
          )}
        >
          <StickyNote className="w-4 h-4 text-amber-600" />
          信纸样式
        </h3>
        <div ref={scrollRef} className="relative">
          <div
            className={cn(
              'flex gap-2.5 overflow-x-auto pb-2',
              'scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent',
              '-mx-1 px-1'
            )}
          >
            {paperPresets.map((paper) => {
              const isSelected = selectedPaperId === paper.id
              return (
                <button
                  key={paper.id}
                  onClick={() => setSelectedPaperId(paper.id)}
                  className={cn(
                    'relative shrink-0',
                    'flex flex-col items-center gap-2',
                    'p-2 rounded-xl transition-all duration-200',
                    'group',
                    isSelected
                      ? 'bg-amber-50 ring-2 ring-amber-400 shadow-md shadow-amber-100'
                      : 'hover:bg-stone-50'
                  )}
                >
                  <div
                    className={cn(
                      'relative w-16 h-20 rounded-md',
                      'border shadow-sm overflow-hidden',
                      'transition-all duration-200',
                      isSelected
                        ? 'border-amber-400 scale-105'
                        : 'border-stone-200 group-hover:border-stone-300 group-hover:scale-102'
                    )}
                    style={{ backgroundColor: paper.bgColor }}
                  >
                    {paper.hasLines && (
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent ${paper.lineSpacing - 1}px,
                            ${paper.lineColor} ${paper.lineSpacing - 1}px,
                            ${paper.lineColor} ${paper.lineSpacing}px
                          )`,
                        }}
                      />
                    )}
                    {paper.id === 'grid' && (
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent ${paper.lineSpacing - 1}px,
                            ${paper.lineColor} ${paper.lineSpacing - 1}px,
                            ${paper.lineColor} ${paper.lineSpacing}px
                          )`,
                        }}
                      />
                    )}
                    {isSelected && (
                      <div
                        className={cn(
                          'absolute top-1 right-1',
                          'w-4 h-4 rounded-full',
                          'bg-gradient-to-br from-amber-500 to-orange-600',
                          'flex items-center justify-center',
                          'shadow-sm'
                        )}
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium whitespace-nowrap',
                      isSelected ? 'text-amber-700 font-semibold' : 'text-stone-500'
                    )}
                  >
                    {paper.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

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
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                纸张背景
              </label>
              <span className="text-xs font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                {paperBgColor.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative p-1 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner">
                <input
                  type="color"
                  value={paperBgColor}
                  onChange={(e) => setPaperBgColor(e.target.value)}
                  className="w-12 h-12 rounded-md cursor-pointer border-2 border-white shadow-md"
                />
              </div>
              <div className="flex gap-1.5">
                {['#ffffff', '#fdf6e3', '#f5f5dc', '#c9a67a', '#f4ecd8'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPaperBgColor(color)}
                    className={cn(
                      'w-7 h-7 rounded-lg border-2 transition-all duration-200',
                      'hover:scale-110 hover:shadow-md',
                      paperBgColor === color
                        ? 'border-amber-500 ring-2 ring-amber-200 scale-105'
                        : 'border-white shadow-sm'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
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
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                线条颜色
              </label>
              <span className="text-xs font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                {paperLineColor.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative p-1 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner">
                <input
                  type="color"
                  value={paperLineColor}
                  onChange={(e) => setPaperLineColor(e.target.value)}
                  className="w-12 h-12 rounded-md cursor-pointer border-2 border-white shadow-md"
                />
              </div>
              <div className="flex gap-1.5">
                {['#d0d0d0', '#e8d8b0', '#f0c97a', '#c4b896', '#8b6b4a'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPaperLineColor(color)}
                    className={cn(
                      'w-7 h-7 rounded-lg border-2 transition-all duration-200',
                      'hover:scale-110 hover:shadow-md',
                      paperLineColor === color
                        ? 'border-amber-500 ring-2 ring-amber-200 scale-105'
                        : 'border-white shadow-sm'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
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
                <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
                行距
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {paperLineSpacing}px
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={60}
              value={paperLineSpacing}
              onChange={(e) => setPaperLineSpacing(Number(e.target.value))}
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

          <div
            className={cn(
              'flex items-center justify-between',
              'p-3 rounded-lg',
              'bg-white/60 border border-stone-200'
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
                <ListOrdered className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-stone-700">显示装订线</span>
                <span className="text-[11px] text-stone-400">左侧显示装订边距线</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showBindingLine}
                onChange={(e) => setShowBindingLine(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={cn(
                  'w-11 h-6 rounded-full transition-colors duration-300',
                  'peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500',
                  'bg-stone-200',
                  'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-200',
                  'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
                  'after:bg-white after:rounded-full after:h-5 after:w-5',
                  'after:shadow-md after:transition-all after:duration-300',
                  'peer-checked:after:translate-x-5'
                )}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
