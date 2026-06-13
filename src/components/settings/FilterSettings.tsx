import { Check, Wand2, Sliders, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type { FilterType } from '@/types'

const filterIcons: Record<FilterType, string> = {
  none: '🎨',
  inkBleed: '💧',
  pencilSketch: '✏️',
  penStroke: '🖋️',
  brushStroke: '🖌️',
  watercolor: '🎨',
  carbonCopy: '📋',
  fountainPen: '🖊️',
  crayon: '🖍️',
  marker: '🖊️',
}

export default function FilterSettings() {
  const {
    activeFilter,
    setActiveFilter,
    filterIntensity,
    setFilterIntensity,
    filterPresets,
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
          <Wand2 className="w-4 h-4 text-amber-600" />
          手写风格滤镜
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {filterPresets.map((filter) => {
            const isSelected = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'relative group',
                  'p-3 rounded-xl text-left',
                  'border-2 transition-all duration-200',
                  'hover:shadow-md hover:-translate-y-0.5',
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{filterIcons[filter.id]}</span>
                  <p
                    className={cn(
                      'text-sm font-bold leading-tight',
                      isSelected ? 'text-amber-900' : 'text-stone-800'
                    )}
                  >
                    {filter.name}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-[11px] leading-tight',
                    isSelected ? 'text-amber-700' : 'text-stone-500'
                  )}
                >
                  {filter.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {activeFilter !== 'none' && (
        <div
          className={cn(
            'p-4 rounded-xl',
            'bg-gradient-to-br from-stone-50 to-amber-50/40',
            'border border-stone-200'
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={cn(
                  'text-sm font-semibold text-stone-700',
                  'flex items-center gap-1.5'
                )}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                滤镜强度
              </label>
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-md',
                  'bg-white text-amber-700',
                  'border border-amber-200',
                  'shadow-sm'
                )}
              >
                {(filterIntensity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(Number(e.target.value))}
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
              <span>轻柔</span>
              <span>适中</span>
              <span>强烈</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          'p-3 rounded-xl',
          'bg-gradient-to-br from-violet-50 to-fuchsia-50',
          'border border-violet-100'
        )}
      >
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-violet-800 mb-1">
              滤镜效果说明
            </p>
            <ul className="text-[11px] text-violet-700/80 space-y-0.5">
              <li>• <b>墨迹晕染</b>：模拟墨水在纸张上渗透晕开</li>
              <li>• <b>铅笔素描</b>：细腻的铅笔排线质感</li>
              <li>• <b>钢笔笔触</b>：经典钢笔书写轻重变化</li>
              <li>• <b>毛笔笔触</b>：毛笔书法飞白效果</li>
              <li>• <b>水彩渲染</b>：水彩画柔和晕染效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
