import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Stamp, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import StampCanvas from './StampCanvas'
import { renderStampToCanvas } from '@/utils/stampRenderer'

export default function StampPanel() {
  const {
    stamps,
    deleteStamp,
    updateStampName,
    selectedStampId,
    setSelectedStampId,
    setIsPlacingStamp,
  } = useWorkspaceStore()

  const [showCanvas, setShowCanvas] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const handleSelectStamp = (id: string) => {
    if (selectedStampId === id) {
      setSelectedStampId(null)
      setIsPlacingStamp(false)
    } else {
      setSelectedStampId(id)
      setIsPlacingStamp(true)
    }
  }

  const startEditing = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      updateStampName(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleRegenerate = (stamp: typeof stamps[number]) => {
    setRegeneratingId(stamp.id)
    setTimeout(() => {
      const result = renderStampToCanvas({ config: stamp.config })
      const store = useWorkspaceStore.getState()
      store.stamps = store.stamps.map((s) =>
        s.id === stamp.id ? { ...s, dataUrl: result.dataUrl } : s
      )
      // force zustand update
      useWorkspaceStore.setState({ stamps: [...store.stamps] })
      setRegeneratingId(null)
    }, 300)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <Stamp className="w-4 h-4 text-red-500" />
            自定义印章
          </h3>
          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              'flex items-center gap-1',
              'transition-all duration-200',
              showCanvas
                ? 'bg-stone-200 text-stone-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {showCanvas ? (
              <>
                <X className="w-3.5 h-3.5" />
                关闭
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                新建印章
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-stone-400">
          创建圆形章、方形章、椭圆形章，自定义内容、字体和边框样式
        </p>
      </div>

      {showCanvas && (
        <div className="border-b border-stone-200">
          <StampCanvas onClose={() => setShowCanvas(false)} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {stamps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Stamp className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-sm text-stone-400 mb-2">暂无保存的印章</p>
            <p className="text-xs text-stone-300">
              点击上方&quot;新建印章&quot;按钮开始创建
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {stamps.map((stamp) => (
              <div
                key={stamp.id}
                className={cn(
                  'relative rounded-xl border-2 overflow-hidden',
                  'transition-all duration-200',
                  selectedStampId === stamp.id
                    ? 'border-red-500 bg-red-50/50 shadow-md shadow-red-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                )}
              >
                {selectedStampId === stamp.id && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      点击文档插入
                    </div>
                  </div>
                )}

                <div
                  className="p-3 bg-white cursor-pointer"
                  onClick={() => handleSelectStamp(stamp.id)}
                >
                  <div
                    className={cn(
                      'w-full h-24 flex items-center justify-center rounded-lg border border-stone-100 transition-all',
                      regeneratingId === stamp.id && 'opacity-50'
                    )}
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #fafaf9 25%, transparent 25%),
                        linear-gradient(-45deg, #fafaf9 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #fafaf9 75%),
                        linear-gradient(-45deg, transparent 75%, #fafaf9 75%)
                      `,
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                    }}
                  >
                    <img
                      src={stamp.dataUrl}
                      alt={stamp.name}
                      className={cn(
                        'max-w-full max-h-full object-contain',
                        regeneratingId === stamp.id && 'animate-spin'
                      )}
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>
                </div>

                <div className="px-3 py-2 bg-stone-50 border-t border-stone-100">
                  {editingId === stamp.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing()
                          if (e.key === 'Escape') cancelEditing()
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:border-red-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          saveEditing()
                        }}
                        className="p-1 rounded text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEditing()
                        }}
                        className="p-1 rounded text-stone-400 hover:bg-stone-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium text-stone-600 truncate cursor-pointer hover:text-red-600"
                        onClick={() => handleSelectStamp(stamp.id)}
                      >
                        {stamp.name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRegenerate(stamp)
                          }}
                          disabled={regeneratingId === stamp.id}
                          className="p-1 rounded text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                          title="重新渲染"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(stamp.id, stamp.name)
                          }}
                          className="p-1 rounded text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="重命名"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('确定要删除这个印章吗？')) {
                              deleteStamp(stamp.id)
                            }
                          }}
                          className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stamps.length > 0 && (
        <div className="p-3 border-t border-stone-200 bg-stone-50">
          <p className="text-[11px] text-stone-400 text-center">
            共 {stamps.length} 个印章 · 点击选中后在文档中点击插入
          </p>
        </div>
      )}
    </div>
  )
}
