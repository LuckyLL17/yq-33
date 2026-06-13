import { useRef, useEffect, useState } from 'react'
import { Save, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore, type StampConfig, type StampShape, type StampBorderStyle } from '@/store/useWorkspaceStore'
import { renderStampToCanvas } from '@/utils/stampRenderer'

interface StampCanvasProps {
  onClose: () => void
}

const STAMP_FONTS = [
  { id: 'songti', name: '宋体', family: '"SimSun", "宋体", "Songti SC", serif' },
  { id: 'fangsong', name: '仿宋', family: '"FangSong", "仿宋", "STFangsong", serif' },
  { id: 'kaiti', name: '楷体', family: '"KaiTi", "楷体", "STKaiti", serif' },
  { id: 'heiti', name: '黑体', family: '"SimHei", "黑体", "STHeiti", sans-serif' },
  { id: 'lishu', name: '隶书', family: '"LiSu", "隶书", "STLiti", serif' },
]

const STAMP_COLORS = [
  '#d32f2f',
  '#c62828',
  '#b71c1c',
  '#e53935',
  '#1976d2',
  '#2e7d32',
  '#000000',
  '#424242',
]

const SHAPE_OPTIONS: { value: StampShape; label: string }[] = [
  { value: 'circle', label: '圆形章' },
  { value: 'square', label: '方形章' },
  { value: 'ellipse', label: '椭圆章' },
]

const BORDER_OPTIONS: { value: StampBorderStyle; label: string }[] = [
  { value: 'solid', label: '实线' },
  { value: 'double', label: '双线' },
  { value: 'dashed', label: '虚线' },
  { value: 'none', label: '无边' },
]

export default function StampCanvas({ onClose }: StampCanvasProps) {
  const addStamp = useWorkspaceStore((s) => s.addStamp)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [config, setConfig] = useState<StampConfig>({
    shape: 'circle',
    topText: '某某有限公司',
    centerText: '专用章',
    bottomText: '',
    fontFamily: STAMP_FONTS[0].family,
    fontSize: 18,
    color: STAMP_COLORS[0],
    borderWidth: 4,
    borderStyle: 'solid',
    size: 200,
    rotation: 0,
    starSize: 20,
    showStar: true,
    innerPadding: 10,
  })

  const [stampName, setStampName] = useState('我的印章')

  const updateConfig = (partial: Partial<StampConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  useEffect(() => {
    if (!canvasRef.current) return
    const { canvas } = renderStampToCanvas({ config, canvas: canvasRef.current })
    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [config])

  const handleReset = () => {
    setConfig({
      shape: 'circle',
      topText: '某某有限公司',
      centerText: '专用章',
      bottomText: '',
      fontFamily: STAMP_FONTS[0].family,
      fontSize: 18,
      color: STAMP_COLORS[0],
      borderWidth: 4,
      borderStyle: 'solid',
      size: 200,
      rotation: 0,
      starSize: 20,
      showStar: true,
      innerPadding: 10,
    })
  }

  const handleSave = () => {
    const result = renderStampToCanvas({ config })
    const name = stampName.trim() || '未命名印章'
    addStamp({
      name,
      dataUrl: result.dataUrl,
      width: result.width,
      height: result.height,
      bgOpacity: 0,
      config: { ...config },
    })
    onClose()
  }

  return (
    <div className="p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-stone-700">印章编辑器</h4>
          <button
            onClick={handleReset}
            className={cn(
              'p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50',
              'transition-colors'
            )}
            title="重置"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div
            className={cn(
              'w-[220px] h-[220px] rounded-xl border-2 border-stone-200',
              'flex items-center justify-center bg-stone-50 overflow-hidden'
            )}
            style={{
              backgroundImage: `
                linear-gradient(45deg, #fafaf9 25%, transparent 25%),
                linear-gradient(-45deg, #fafaf9 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #fafaf9 75%),
                linear-gradient(-45deg, transparent 75%, #fafaf9 75%)
              `,
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
            }}
          >
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        <div className="flex-1 space-y-3 min-w-0 max-h-[420px] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">印章名称</label>
            <input
              type="text"
              value={stampName}
              onChange={(e) => setStampName(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border border-stone-200',
                'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
                'bg-white'
              )}
              placeholder="输入印章名称"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">印章形状</label>
            <div className="grid grid-cols-3 gap-1.5">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateConfig({ shape: opt.value })}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-200',
                    config.shape === opt.value
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              顶部环绕文字
            </label>
            <input
              type="text"
              value={config.topText}
              onChange={(e) => updateConfig({ topText: e.target.value })}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border border-stone-200',
                'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
                'bg-white'
              )}
              placeholder="如：公司名称"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              中心文字
            </label>
            <input
              type="text"
              value={config.centerText}
              onChange={(e) => updateConfig({ centerText: e.target.value })}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border border-stone-200',
                'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
                'bg-white'
              )}
              placeholder="如：专用章、公章"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              底部环绕文字
            </label>
            <input
              type="text"
              value={config.bottomText}
              onChange={(e) => updateConfig({ bottomText: e.target.value })}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border border-stone-200',
                'focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30',
                'bg-white'
              )}
              placeholder="如：编号、日期（可选）"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">字体</label>
            <div className="grid grid-cols-2 gap-1.5">
              {STAMP_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateConfig({ fontFamily: f.family })}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs font-medium text-left',
                    'transition-all duration-200',
                    config.fontFamily === f.family
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                  style={{ fontFamily: f.family }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">边框样式</label>
            <div className="grid grid-cols-4 gap-1.5">
              {BORDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateConfig({ borderStyle: opt.value })}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs font-medium',
                    'transition-all duration-200',
                    config.borderStyle === opt.value
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">印章颜色</label>
            <div className="flex items-center gap-2 flex-wrap">
              {STAMP_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateConfig({ color: c })}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                    config.color === c ? 'border-amber-500 ring-2 ring-amber-300 scale-110' : 'border-white shadow-sm'
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={config.color}
                onChange={(e) => updateConfig({ color: e.target.value })}
                className="w-7 h-7 rounded-full border-2 border-stone-200 cursor-pointer overflow-hidden"
                title="自定义颜色"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-600">字体大小</span>
                <span className="text-[10px] text-stone-400">{config.fontSize}px</span>
              </label>
              <input
                type="range"
                min="10"
                max="32"
                value={config.fontSize}
                onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                className="w-full h-1 accent-amber-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-600">印章尺寸</span>
                <span className="text-[10px] text-stone-400">{config.size}px</span>
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={config.size}
                onChange={(e) => updateConfig({ size: Number(e.target.value) })}
                className="w-full h-1 accent-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-600">边框宽度</span>
                <span className="text-[10px] text-stone-400">{config.borderWidth}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={config.borderWidth}
                onChange={(e) => updateConfig({ borderWidth: Number(e.target.value) })}
                className="w-full h-1 accent-amber-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-600">旋转角度</span>
                <span className="text-[10px] text-stone-400">{config.rotation}°</span>
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={config.rotation}
                onChange={(e) => updateConfig({ rotation: Number(e.target.value) })}
                className="w-full h-1 accent-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-600">五角星</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showStar}
                    onChange={(e) => updateConfig({ showStar: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4 bg-stone-200 rounded-full peer peer-checked:bg-amber-500 transition-colors">
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                </label>
              </label>
            </div>

            {config.showStar && (
              <div>
                <label className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-stone-600">星大小</span>
                  <span className="text-[10px] text-stone-400">{config.starSize}px</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="36"
                  value={config.starSize}
                  onChange={(e) => updateConfig({ starSize: Number(e.target.value) })}
                  className="w-full h-1 accent-amber-600"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-stone-600">内边距</span>
              <span className="text-[10px] text-stone-400">{config.innerPadding}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={config.innerPadding}
              onChange={(e) => updateConfig({ innerPadding: Number(e.target.value) })}
              className="w-full h-1 accent-amber-600"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
        <button
          onClick={onClose}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium',
            'bg-stone-100 text-stone-600 hover:bg-stone-200',
            'transition-colors'
          )}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-medium',
            'flex items-center gap-1.5',
            'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
            'hover:from-amber-600 hover:to-orange-600',
            'shadow-sm shadow-amber-500/30',
            'transition-all duration-200'
          )}
        >
          <Save className="w-3.5 h-3.5" />
          保存印章
        </button>
      </div>
    </div>
  )
}
