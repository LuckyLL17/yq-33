import { useState, useRef, useEffect } from 'react'
import {
  Check,
  Type,
  Palette,
  Wand2,
  Search,
  Plus,
  Trash2,
  Upload,
  X,
  Globe,
  Languages,
  Settings,
  ChevronDown,
  ChevronUp,
  Move,
  MoveVertical,
  Maximize2,
  RotateCw,
  AlignVerticalJustifyStart,
  Droplets,
  Paintbrush,
  Space,
  Rows3,
  SlidersHorizontal,
  Sparkles,
  Feather,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { builtInFonts, buildFontStack, filterFonts, getAllFonts } from '@/utils/fontPresets'
import { loadFont } from '@/utils/fontLoader'
import type { FontPreset, FontCategory, FontSource } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface JitterSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  icon: LucideIcon
}

function JitterSlider({ label, value, onChange, icon: Icon }: JitterSliderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 flex items-center justify-center text-amber-500 flex-shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-stone-600 font-medium truncate">{label}</span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
            {(value * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-gradient-to-r from-amber-100 to-orange-100',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-gradient-to-br',
            '[&::-webkit-slider-thumb]:from-amber-500 [&::-webkit-slider-thumb]:to-orange-600',
            '[&::-webkit-slider-thumb]:shadow-sm',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110'
          )}
        />
      </div>
    </div>
  )
}

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
    jitterPositionX,
    setJitterPositionX,
    jitterPositionY,
    setJitterPositionY,
    jitterSize,
    setJitterSize,
    jitterRotation,
    setJitterRotation,
    jitterBaseline,
    setJitterBaseline,
    jitterInkDensity,
    setJitterInkDensity,
    jitterInkColor,
    setJitterInkColor,
    jitterSpacing,
    setJitterSpacing,
    jitterLineDrift,
    setJitterLineDrift,
    jitterLineTilt,
    setJitterLineTilt,
    jitterHalo,
    setJitterHalo,
    jitterDryBrush,
    setJitterDryBrush,
    customFonts,
    addCustomFont,
    deleteCustomFont,
    fontSearchQuery,
    setFontSearchQuery,
    fontCategoryFilter,
    setFontCategoryFilter,
    fontSourceFilter,
    setFontSourceFilter,
  } = useWorkspaceStore()

  const [showAdvancedJitter, setShowAdvancedJitter] = useState(false)

  const [showAddFont, setShowAddFont] = useState(false)
  const [newFontName, setNewFontName] = useState('')
  const [newFontFamily, setNewFontFamily] = useState('')
  const [newFontUrl, setNewFontUrl] = useState('')
  const [newFontCategory, setNewFontCategory] = useState<FontCategory>('cn')
  const [newFontPreview, setNewFontPreview] = useState('')
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())
  const [showManageMenu, setShowManageMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allFonts = getAllFonts(customFonts)
  const filteredFonts = filterFonts(allFonts, {
    category: fontCategoryFilter === 'all' ? undefined : fontCategoryFilter,
    source: fontSourceFilter === 'all' ? undefined : fontSourceFilter,
    search: fontSearchQuery,
  })

  useEffect(() => {
    const selectedFont = allFonts.find((f) => f.id === selectedFontId)
    if (selectedFont) {
      loadFont(selectedFont)
    }
  }, [selectedFontId, allFonts])

  const handleFontClick = async (font: FontPreset) => {
    setSelectedFontId(font.id)
    if (!loadingFonts.has(font.id)) {
      setLoadingFonts((prev) => new Set(prev).add(font.id))
      await loadFont(font)
      setLoadingFonts((prev) => {
        const next = new Set(prev)
        next.delete(font.id)
        return next
      })
    }
  }

  const handleAddFont = () => {
    if (!newFontName || !newFontFamily) return

    const fontData: Omit<FontPreset, 'id' | 'isBuiltIn' | 'source' | 'createdAt'> & { source?: FontSource } = {
      name: newFontName,
      family: newFontFamily,
      previewText: newFontPreview || (newFontCategory === 'cn' ? '手写文字预览效果' : 'Handwritten preview text'),
      category: newFontCategory,
      fontUrl: newFontUrl || undefined,
      fallbackFonts: 'cursive, sans-serif',
    }

    addCustomFont(fontData)

    setNewFontName('')
    setNewFontFamily('')
    setNewFontUrl('')
    setNewFontPreview('')
    setShowAddFont(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setNewFontUrl(dataUrl)
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      if (!newFontName) setNewFontName(fileName)
      if (!newFontFamily) setNewFontFamily(fileName)
    }
    reader.readAsDataURL(file)
  }

  const categoryOptions: { id: FontCategory | 'all'; name: string; icon: typeof Type }[] = [
    { id: 'all', name: '全部', icon: Languages },
    { id: 'cn', name: '中文', icon: Type },
    { id: 'en', name: '英文', icon: Globe },
  ]

  const sourceOptions: { id: FontSource | 'all'; name: string }[] = [
    { id: 'all', name: '全部来源' },
    { id: 'google', name: 'Google Fonts' },
    { id: 'custom', name: '自定义' },
  ]

  return (
    <div className="p-5 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3
            className={cn(
              'text-sm font-bold text-stone-800',
              'flex items-center gap-2'
            )}
          >
            <Type className="w-4 h-4 text-amber-600" />
            字体样式
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddFont(true)}
              className={cn(
                'h-7 px-2.5 rounded-lg text-xs font-medium',
                'flex items-center gap-1',
                'bg-amber-50 text-amber-700 border border-amber-200',
                'hover:bg-amber-100',
                'transition-all duration-200'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              添加字体
            </button>
            <div className="relative">
              <button
                onClick={() => setShowManageMenu(!showManageMenu)}
                className={cn(
                  'h-7 w-7 rounded-lg',
                  'flex items-center justify-center',
                  'bg-stone-50 text-stone-600 border border-stone-200',
                  'hover:bg-stone-100',
                  'transition-all duration-200'
                )}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              {showManageMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowManageMenu(false)}
                  />
                  <div
                    className={cn(
                      'absolute right-0 top-9 z-20',
                      'w-36 py-1.5 rounded-lg',
                      'bg-white border border-stone-200',
                      'shadow-lg'
                    )}
                  >
                    {sourceOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFontSourceFilter(opt.id)
                          setShowManageMenu(false)
                        }}
                        className={cn(
                          'w-full px-3 py-1.5 text-left text-xs',
                          'hover:bg-amber-50',
                          'transition-colors',
                          fontSourceFilter === opt.id
                            ? 'text-amber-700 font-medium'
                            : 'text-stone-600'
                        )}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={fontSearchQuery}
            onChange={(e) => setFontSearchQuery(e.target.value)}
            placeholder="搜索字体..."
            className={cn(
              'w-full h-8 pl-8 pr-3 rounded-lg',
              'text-xs',
              'bg-stone-50 border border-stone-200',
              'focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200',
              'transition-all duration-200'
            )}
          />
          {fontSearchQuery && (
            <button
              onClick={() => setFontSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-3">
          {categoryOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.id}
                onClick={() => setFontCategoryFilter(opt.id)}
                className={cn(
                  'flex-1 h-7 rounded-lg text-xs font-medium',
                  'flex items-center justify-center gap-1',
                  'transition-all duration-200',
                  fontCategoryFilter === opt.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                )}
              >
                <Icon className="w-3 h-3" />
                {opt.name}
              </button>
            )
          })}
        </div>

        <div
          className={cn(
            'grid grid-cols-2 gap-2',
            'max-h-64 overflow-y-auto pr-1',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-stone-200'
          )}
        >
          {filteredFonts.map((font) => {
            const isSelected = selectedFontId === font.id
            const isLoading = loadingFonts.has(font.id)
            return (
              <div key={font.id} className="relative group">
                <button
                  onClick={() => handleFontClick(font)}
                  className={cn(
                    'relative w-full group',
                    'p-2.5 rounded-xl text-left',
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
                        'w-4.5 h-4.5 rounded-full',
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
                      'text-base mb-1 leading-tight truncate',
                      isSelected ? 'text-amber-900' : 'text-stone-800',
                      isLoading && 'opacity-50'
                    )}
                    style={{ fontFamily: buildFontStack(font) }}
                  >
                    {font.previewText}
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        'text-[10px] font-medium',
                        isSelected ? 'text-amber-700' : 'text-stone-500'
                      )}
                    >
                      {font.name}
                    </p>
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded',
                        font.isBuiltIn
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {font.source === 'google' ? 'Google' : font.source === 'custom' ? '自定义' : '系统'}
                    </span>
                  </div>
                </button>
                {!font.isBuiltIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCustomFont(font.id)
                    }}
                    className={cn(
                      'absolute -top-1.5 -right-1.5',
                      'w-5 h-5 rounded-full',
                      'bg-rose-500 text-white',
                      'flex items-center justify-center',
                      'opacity-0 group-hover:opacity-100',
                      'shadow-md',
                      'transition-opacity duration-200',
                      'hover:bg-rose-600'
                    )}
                    title="删除字体"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
          {filteredFonts.length === 0 && (
            <div className="col-span-2 py-8 text-center text-stone-400 text-sm">
              没有找到匹配的字体
            </div>
          )}
        </div>
      </div>

      {showAddFont && (
        <div
          className={cn(
            'p-4 rounded-xl',
            'bg-gradient-to-br from-amber-50 to-orange-50/50',
            'border border-amber-200'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-amber-900">添加自定义字体</h4>
            <button
              onClick={() => setShowAddFont(false)}
              className="text-amber-500 hover:text-amber-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">字体名称</label>
              <input
                type="text"
                value={newFontName}
                onChange={(e) => setNewFontName(e.target.value)}
                placeholder="例如：我的手写体"
                className={cn(
                  'w-full h-8 px-3 rounded-lg text-xs',
                  'bg-white border border-stone-200',
                  'focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">字体族名</label>
              <input
                type="text"
                value={newFontFamily}
                onChange={(e) => setNewFontFamily(e.target.value)}
                placeholder="例如：MyHandwriting"
                className={cn(
                  'w-full h-8 px-3 rounded-lg text-xs',
                  'bg-white border border-stone-200',
                  'focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">字体分类</label>
              <div className="flex gap-2">
                {(['cn', 'en'] as FontCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewFontCategory(cat)}
                    className={cn(
                      'flex-1 h-8 rounded-lg text-xs font-medium',
                      'transition-all duration-200',
                      newFontCategory === cat
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    )}
                  >
                    {cat === 'cn' ? '中文' : '英文'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">字体文件</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-full h-10 rounded-lg text-xs font-medium',
                  'flex items-center justify-center gap-2',
                  'bg-white border-2 border-dashed border-stone-300',
                  'text-stone-600',
                  'hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50',
                  'transition-all duration-200'
                )}
              >
                <Upload className="w-4 h-4" />
                {newFontUrl ? '更换字体文件' : '上传字体文件 (.ttf, .otf, .woff)'}
              </button>
              {newFontUrl && (
                <p className="text-[10px] text-green-600 mt-1">✓ 已选择字体文件</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">预览文字</label>
              <input
                type="text"
                value={newFontPreview}
                onChange={(e) => setNewFontPreview(e.target.value)}
                placeholder="自定义预览文字（可选）"
                className={cn(
                  'w-full h-8 px-3 rounded-lg text-xs',
                  'bg-white border border-stone-200',
                  'focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                )}
              />
            </div>
            <button
              onClick={handleAddFont}
              disabled={!newFontName || !newFontFamily}
              className={cn(
                'w-full h-9 rounded-lg text-sm font-bold',
                'bg-gradient-to-r from-amber-500 to-orange-500',
                'text-white',
                'shadow-md shadow-amber-200',
                'hover:from-amber-600 hover:to-orange-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )}
            >
              添加字体
            </button>
          </div>
        </div>
      )}

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

            <button
              onClick={() => setShowAdvancedJitter(!showAdvancedJitter)}
              className={cn(
                'w-full mt-3 h-7 rounded-lg text-xs font-medium',
                'flex items-center justify-center gap-1',
                'bg-stone-50 text-stone-600 border border-stone-200',
                'hover:bg-stone-100 hover:text-stone-700',
                'transition-all duration-200'
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              精细调节
              {showAdvancedJitter ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {showAdvancedJitter && (
            <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-stone-700">精细参数</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  位置偏移
                </p>

                <JitterSlider
                  label="横向抖动"
                  value={jitterPositionX}
                  onChange={setJitterPositionX}
                  icon={Move}
                />

                <JitterSlider
                  label="纵向抖动"
                  value={jitterPositionY}
                  onChange={setJitterPositionY}
                  icon={MoveVertical}
                />

                <JitterSlider
                  label="基线偏移"
                  value={jitterBaseline}
                  onChange={setJitterBaseline}
                  icon={AlignVerticalJustifyStart}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  大小与旋转
                </p>

                <JitterSlider
                  label="字号变化"
                  value={jitterSize}
                  onChange={setJitterSize}
                  icon={Maximize2}
                />

                <JitterSlider
                  label="字符旋转"
                  value={jitterRotation}
                  onChange={setJitterRotation}
                  icon={RotateCw}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  墨迹效果
                </p>

                <JitterSlider
                  label="墨迹浓度"
                  value={jitterInkDensity}
                  onChange={setJitterInkDensity}
                  icon={Droplets}
                />

                <JitterSlider
                  label="颜色深浅"
                  value={jitterInkColor}
                  onChange={setJitterInkColor}
                  icon={Paintbrush}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Space className="w-3 h-3" />
                  字间距
                </p>

                <JitterSlider
                  label="间距抖动"
                  value={jitterSpacing}
                  onChange={setJitterSpacing}
                  icon={Space}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Rows3 className="w-3 h-3" />
                  行效果
                </p>

                <JitterSlider
                  label="整行漂移"
                  value={jitterLineDrift}
                  onChange={setJitterLineDrift}
                  icon={Rows3}
                />

                <JitterSlider
                  label="行倾斜"
                  value={jitterLineTilt}
                  onChange={setJitterLineTilt}
                  icon={SlidersHorizontal}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                  <Feather className="w-3 h-3" />
                  笔触特效
                </p>

                <JitterSlider
                  label="重影晕染"
                  value={jitterHalo}
                  onChange={setJitterHalo}
                  icon={Sparkles}
                />

                <JitterSlider
                  label="飞白干笔"
                  value={jitterDryBrush}
                  onChange={setJitterDryBrush}
                  icon={Feather}
                />
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-stone-500 mb-2">快速预设</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setJitterPositionX(0.2)
                      setJitterPositionY(0.2)
                      setJitterSize(0.15)
                      setJitterRotation(0.1)
                      setJitterBaseline(0.15)
                      setJitterInkDensity(0.2)
                      setJitterInkColor(0.1)
                      setJitterSpacing(0.15)
                      setJitterLineDrift(0.1)
                      setJitterLineTilt(0.05)
                      setJitterHalo(0.1)
                      setJitterDryBrush(0.1)
                    }}
                    className={cn(
                      'h-7 rounded-lg text-xs font-medium',
                      'bg-stone-100 text-stone-600',
                      'hover:bg-stone-200',
                      'transition-colors'
                    )}
                  >
                    工整
                  </button>
                  <button
                    onClick={() => {
                      setJitterPositionX(0.6)
                      setJitterPositionY(0.6)
                      setJitterSize(0.5)
                      setJitterRotation(0.5)
                      setJitterBaseline(0.5)
                      setJitterInkDensity(0.5)
                      setJitterInkColor(0.4)
                      setJitterSpacing(0.5)
                      setJitterLineDrift(0.4)
                      setJitterLineTilt(0.3)
                      setJitterHalo(0.3)
                      setJitterDryBrush(0.3)
                    }}
                    className={cn(
                      'h-7 rounded-lg text-xs font-medium',
                      'bg-amber-100 text-amber-700',
                      'hover:bg-amber-200',
                      'transition-colors'
                    )}
                  >
                    自然
                  </button>
                  <button
                    onClick={() => {
                      setJitterPositionX(1)
                      setJitterPositionY(1)
                      setJitterSize(0.9)
                      setJitterRotation(0.9)
                      setJitterBaseline(0.85)
                      setJitterInkDensity(0.9)
                      setJitterInkColor(0.8)
                      setJitterSpacing(0.9)
                      setJitterLineDrift(0.85)
                      setJitterLineTilt(0.7)
                      setJitterHalo(0.7)
                      setJitterDryBrush(0.6)
                    }}
                    className={cn(
                      'h-7 rounded-lg text-xs font-medium',
                      'bg-orange-100 text-orange-700',
                      'hover:bg-orange-200',
                      'transition-colors'
                    )}
                  >
                    潦草
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
