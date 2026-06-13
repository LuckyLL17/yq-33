import { useCallback, useMemo } from 'react'
import {
  Pencil,
  Highlighter,
  Circle,
  Square,
  Minus,
  ArrowRight,
  Underline,
  Type,
  Trash2,
  Plus,
  Download,
  Upload,
  List,
  Palette,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import type {
  Annotation,
  AnnotationTool,
  AnnotationItemType,
} from '@/store/useWorkspaceStore'

const TOOL_ICONS: Record<AnnotationTool | AnnotationItemType, typeof Pencil> = {
  pen: Pencil,
  path: Pencil,
  highlighter: Highlighter,
  highlight: Highlighter,
  circle: Circle,
  rect: Square,
  line: Minus,
  arrow: ArrowRight,
  underline: Underline,
  wavy: Underline,
  text: Type,
  eraser: Trash2,
}

const TOOL_LABELS: Record<AnnotationItemType, string> = {
  path: '自由画笔',
  highlight: '荧光笔',
  circle: '圆圈',
  rect: '方框',
  line: '直线',
  arrow: '箭头',
  underline: '下划线',
  wavy: '波浪线',
  text: '文字标注',
}

export default function AnnotationPanel() {
  const {
    annotations,
    deleteAnnotation,
    clearAllAnnotations,
    clearPageAnnotations,
    setIsAnnotating,
    currentPage,
    setCurrentPage,
    selectedAnnotationId,
    setSelectedAnnotationId,
    setActiveAnnotationTool,
    setAnnotationStyle,
    annotationPresets,
    addAnnotationPreset,
    deleteAnnotationPreset,
    totalPages,
    loadAnnotations,
  } = useWorkspaceStore()

  const pageGroups = useMemo(() => {
    const groups: Record<number, Annotation[]> = {}
    for (const ann of annotations) {
      if (!groups[ann.pageIndex]) groups[ann.pageIndex] = []
      groups[ann.pageIndex].push(ann)
    }
    return groups
  }, [annotations])

  const totalCount = annotations.length
  const currentPageCount = annotations.filter(
    (a) => a.pageIndex === currentPage - 1
  ).length

  const handleStartAnnotating = useCallback(() => {
    setIsAnnotating(true)
  }, [setIsAnnotating])

  const handleJumpToAnnotation = useCallback(
    (ann: Annotation) => {
      setCurrentPage(ann.pageIndex + 1)
      setSelectedAnnotationId(ann.id)
    },
    [setCurrentPage, setSelectedAnnotationId]
  )

  const handleExportAnnotations = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      annotations,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annotations_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [annotations])

  const handleImportAnnotations = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (Array.isArray(data.annotations)) {
          loadAnnotations(data.annotations)
        } else if (Array.isArray(data)) {
          loadAnnotations(data)
        }
      } catch (err) {
        alert('导入失败：文件格式错误')
      }
    }
    input.click()
  }, [loadAnnotations])

  const handleApplyPreset = useCallback(
    (presetId: string) => {
      const preset = annotationPresets.find((p) => p.id === presetId)
      if (preset) {
        setActiveAnnotationTool(preset.tool)
        setAnnotationStyle(preset.style)
      }
    },
    [annotationPresets, setActiveAnnotationTool, setAnnotationStyle]
  )

  const handleSaveCurrentAsPreset = useCallback(() => {
    const toolNames: Record<string, string> = {
      pen: '画笔',
      highlighter: '荧光笔',
      circle: '圆圈',
      rect: '方框',
      line: '直线',
      arrow: '箭头',
      underline: '下划线',
      wavy: '波浪线',
      text: '文字',
    }
    const name = `${toolNames[useWorkspaceStore.getState().activeAnnotationTool] || '自定义'}`
    addAnnotationPreset({
      name,
      tool: useWorkspaceStore.getState().activeAnnotationTool,
      style: { ...useWorkspaceStore.getState().annotationStyle },
    })
  }, [addAnnotationPreset])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-rose-50 to-orange-50">
        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
          <List className="w-5 h-5 text-rose-600" />
          批注与标注
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          在信纸上添加手写批注、圈点、划线和文字标注
        </p>
      </div>

      <div className="p-3 border-b border-stone-200">
        <button
          onClick={handleStartAnnotating}
          className={cn(
            'w-full h-10 rounded-xl text-sm font-bold',
            'flex items-center justify-center gap-2',
            'bg-gradient-to-r from-rose-500 to-orange-500 text-white',
            'hover:from-rose-600 hover:to-orange-600',
            'shadow-md shadow-rose-500/30',
            'transition-all duration-200 hover:scale-[1.02]'
          )}
        >
          <Pencil className="w-4 h-4" />
          开始批注
        </button>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-center">
            <div className="text-lg font-bold text-rose-600">{totalCount}</div>
            <div className="text-[10px] text-stone-500">全部批注</div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-center">
            <div className="text-lg font-bold text-amber-600">{currentPageCount}</div>
            <div className="text-[10px] text-stone-500">本页批注</div>
          </div>
          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-center">
            <div className="text-lg font-bold text-blue-600">{totalPages}</div>
            <div className="text-[10px] text-stone-500">总页数</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              快捷样式
            </h3>
            <button
              onClick={handleSaveCurrentAsPreset}
              className={cn(
                'p-1 rounded-md',
                'text-rose-600 hover:bg-rose-50',
                'transition-colors'
              )}
              title="保存当前样式为预设"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {annotationPresets.map((preset) => {
              const Icon = TOOL_ICONS[preset.tool]
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={cn(
                    'p-2 rounded-lg text-left',
                    'flex items-center gap-2',
                    'bg-stone-50 border border-stone-200',
                    'hover:border-rose-300 hover:bg-rose-50/50',
                    'transition-all duration-200 group'
                  )}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${preset.style.color}20` }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: preset.style.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-stone-700 truncate">
                      {preset.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.style.color }}
                      />
                      <span className="text-[9px] text-stone-400">
                        {preset.style.strokeWidth}px
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAnnotationPreset(preset.id)
                    }}
                    className={cn(
                      'p-0.5 rounded opacity-0 group-hover:opacity-100',
                      'text-stone-400 hover:text-rose-500 hover:bg-rose-50',
                      'transition-all'
                    )}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-3 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              批注记录
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportAnnotations}
                disabled={totalCount === 0}
                className={cn(
                  'p-1 rounded-md',
                  'text-stone-500 hover:text-blue-600 hover:bg-blue-50',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
                title="导出批注"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleImportAnnotations}
                className={cn(
                  'p-1 rounded-md',
                  'text-stone-500 hover:text-green-600 hover:bg-green-50',
                  'transition-colors'
                )}
                title="导入批注"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <Pencil className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-xs text-stone-400">还没有批注</p>
              <p className="text-[10px] text-stone-400 mt-1">
                点击上方按钮开始添加批注
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(pageGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([pageIdx, pageAnns]) => (
                  <div key={pageIdx} className="rounded-lg overflow-hidden border border-stone-200">
                    <div
                      className={cn(
                        'px-2.5 py-1.5 flex items-center justify-between cursor-pointer',
                        currentPage === Number(pageIdx) + 1
                          ? 'bg-rose-100 border-b border-rose-200'
                          : 'bg-stone-50 border-b border-stone-200',
                        'hover:bg-rose-50 transition-colors'
                      )}
                      onClick={() => setCurrentPage(Number(pageIdx) + 1)}
                    >
                      <span
                        className={cn(
                          'text-xs font-bold',
                          currentPage === Number(pageIdx) + 1
                            ? 'text-rose-700'
                            : 'text-stone-600'
                        )}
                      >
                        第 {Number(pageIdx) + 1} 页
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 text-stone-500 font-medium">
                        {pageAnns.length} 条
                      </span>
                    </div>
                    <div className="divide-y divide-stone-100 bg-white">
                      {pageAnns.map((ann) => {
                        const Icon = TOOL_ICONS[ann.type] || Pencil
                        const isSelected = selectedAnnotationId === ann.id
                        return (
                          <div
                            key={ann.id}
                            className={cn(
                              'p-2 flex items-center gap-2 cursor-pointer group',
                              isSelected
                                ? 'bg-rose-50'
                                : 'hover:bg-stone-50',
                              'transition-colors'
                            )}
                            onClick={() => handleJumpToAnnotation(ann)}
                          >
                            <div
                              className="w-6 h-6 rounded shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: `${ann.style.color}20` }}
                            >
                              <Icon
                                className="w-3 h-3"
                                style={{ color: ann.style.color }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-stone-700">
                                {TOOL_LABELS[ann.type]}
                              </div>
                              {ann.type === 'text' && (
                                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                                  {ann.text}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteAnnotation(ann.id)
                              }}
                              className={cn(
                                'p-1 rounded opacity-0 group-hover:opacity-100',
                                'text-stone-400 hover:text-rose-500 hover:bg-rose-50',
                                'transition-all'
                              )}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearPageAnnotations(currentPage - 1)}
              disabled={currentPageCount === 0}
              className={cn(
                'flex-1 h-8 rounded-lg text-xs font-medium',
                'flex items-center justify-center gap-1',
                'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <Trash2 className="w-3 h-3" />
              清除本页
            </button>
            <button
              onClick={() => {
                if (confirm('确定清除全部批注吗？')) {
                  clearAllAnnotations()
                }
              }}
              disabled={totalCount === 0}
              className={cn(
                'flex-1 h-8 rounded-lg text-xs font-medium',
                'flex items-center justify-center gap-1',
                'bg-rose-50 text-rose-600 hover:bg-rose-100',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <Trash2 className="w-3 h-3" />
              全部清除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
