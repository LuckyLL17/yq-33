import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, PenTool, Image, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import SignatureCanvas from './SignatureCanvas'

export default function SignaturePanel() {
  const {
    signatures,
    deleteSignature,
    updateSignatureName,
    updateSignatureBgOpacity,
    selectedSignatureId,
    setSelectedSignatureId,
    setIsPlacingSignature,
  } = useWorkspaceStore()

  const [showCanvas, setShowCanvas] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleSelectSignature = (id: string) => {
    if (selectedSignatureId === id) {
      setSelectedSignatureId(null)
      setIsPlacingSignature(false)
    } else {
      setSelectedSignatureId(id)
      setIsPlacingSignature(true)
    }
  }

  const startEditing = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      updateSignatureName(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-amber-600" />
            手写签名
          </h3>
          <button
            onClick={() => setShowCanvas(!showCanvas)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              'flex items-center gap-1',
              'transition-all duration-200',
              showCanvas
                ? 'bg-stone-200 text-stone-600'
                : 'bg-amber-500 text-white hover:bg-amber-600'
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
                新建签名
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-stone-400">
          在信纸上书写签名，可调整背景透明度，默认无背景
        </p>
      </div>

      {showCanvas && (
        <div className="border-b border-stone-200">
          <SignatureCanvas onClose={() => setShowCanvas(false)} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {signatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Image className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-sm text-stone-400 mb-2">暂无保存的签名</p>
            <p className="text-xs text-stone-300">
              点击上方"新建签名"按钮开始创建
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className={cn(
                  'relative rounded-xl border-2 overflow-hidden',
                  'transition-all duration-200',
                  selectedSignatureId === sig.id
                    ? 'border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                )}
              >
                {selectedSignatureId === sig.id && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      点击文档插入
                    </div>
                  </div>
                )}

                <div
                  className="p-3 bg-white cursor-pointer"
                  onClick={() => handleSelectSignature(sig.id)}
                >
                  <div
                    className="w-full h-16 flex items-center justify-center rounded-lg border border-stone-100"
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
                      src={sig.dataUrl}
                      alt={sig.name}
                      className="max-w-full max-h-full object-contain"
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>
                </div>

                <div className="px-3 py-2 bg-stone-50 border-t border-stone-100">
                  {editingId === sig.id ? (
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
                        className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded focus:outline-none focus:border-amber-500"
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium text-stone-600 truncate cursor-pointer hover:text-amber-700"
                          onClick={() => handleSelectSignature(sig.id)}
                        >
                          {sig.name}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(sig.id, sig.name)
                            }}
                            className="p-1 rounded text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="重命名"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('确定要删除这个签名吗？')) {
                                deleteSignature(sig.id)
                              }
                            }}
                            className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-stone-400" />
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          背景
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={(sig.bgOpacity ?? 0) * 100}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateSignatureBgOpacity(sig.id, Number(e.target.value) / 100)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-1 accent-amber-600"
                        />
                        <span className="text-[10px] text-stone-400 w-8 text-right">
                          {Math.round((sig.bgOpacity ?? 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {signatures.length > 0 && (
        <div className="p-3 border-t border-stone-200 bg-stone-50">
          <p className="text-[11px] text-stone-400 text-center">
            共 {signatures.length} 个签名 · 点击选中后在文档中点击插入
          </p>
        </div>
      )}
    </div>
  )
}
