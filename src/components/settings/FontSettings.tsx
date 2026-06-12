import { Check, Type, Palette, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { fontPresets } from '@/constants/presets'

export default function FontSettings() {
  const {
    selectedFontId,
    setSelectedFontId,
    fontSize,
    setFontSize,
    inkColor,
    setInkColor,
    jitterAmount,
    setJitterAmount,
  } = useWorkspaceStore()

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3
          className={cn(
            'text-sm font-bold text-stone-800 mb-3',
            'flex items-center gap-2'
          )}
        >
          <Type className="w-4 h-4 text-amber-600" />
          字体样式
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {fontPresets.map((font) => {
            const isSelected = selectedFontId === font.id
            return (
              <button
                key={font.id}
                onClick={() => setSelectedFontId(font.id)}
                className={cn(
                  'relative group',
                  'p-3 rounded-xl text-left',
                  'border-2 transition-all duration-200',
                  'hover:shadow-md',
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 shadow-sm shadow-amber-100'
                    : 'border-stone-200 bg-white hover:border-amber-300'
                )}
              >
                {isSelected && (
                  <div
                    className={cn(
                      'absolute top-1.5 right-1.5',
                      'w-5 h-5 rounded-full',
                      'bg-gradient-to-br from-amber-500 to-orange-600',
                      'flex items-center justify-center',
                      'shadow-sm'
                    )}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <p
                  className={cn(
                    'text-lg mb-1.5 leading-tight truncate',
                    isSelected ? 'text-amber-900' : 'text-stone-800'
                  )}
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.preview}
                </p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-amber-700' : 'text-stone-500'
                  )}
                >
                  {font.name}
                </p>
              </button>
            )
          })}
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
                <Type className="w-3.5 h-3.5 text-amber-600" />
                字号
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {fontSize}px
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
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
              <span>12</span>
              <span>30</span>
              <span>48</span>
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
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                墨色
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                  {inkColor.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'relative p-1 rounded-xl',
                  'bg-gradient-to-br from-amber-100 to-orange-100',
                  'shadow-inner'
                )}
              >
                <input
                  type="color"
                  value={inkColor}
                  onChange={(e) => setInkColor(e.target.value)}
                  className={cn(
                    'w-14 h-14 rounded-lg cursor-pointer',
                    'border-2 border-white',
                    'shadow-md'
                  )}
                />
              </div>
              <div className="flex gap-1.5">
                {['#2c2c2c', '#1e3a5f', '#5c3d2e', '#8b4513', '#722f37'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setInkColor(color)}
                    className={cn(
                      'w-7 h-7 rounded-lg border-2 transition-all duration-200',
                      'hover:scale-110 hover:shadow-md',
                      inkColor === color
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
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                字迹抖动
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {(jitterAmount * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={jitterAmount}
              onChange={(e) => setJitterAmount(Number(e.target.value))}
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
              <span>工整</span>
              <span>自然</span>
              <span>潦草</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
