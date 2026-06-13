import { useState, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  X,
  Search,
  LayoutGrid,
  Mail,
  Gift,
  FileText,
  Heart,
  MoreHorizontal,
  Calendar,
  FileWarning,
  Cake,
  PartyPopper,
  Leaf,
  HeartHandshake,
  Briefcase,
  FileSearch,
  MessageCircleWarning,
  Award,
  Users,
  UsersRound,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { textTemplates, templateCategories, type TextTemplate } from '@/constants/presets'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  Mail,
  Gift,
  FileText,
  Heart,
  MoreHorizontal,
  Calendar,
  FileWarning,
  Cake,
  PartyPopper,
  Leaf,
  HeartHandshake,
  Briefcase,
  FileSearch,
  MessageCircleWarning,
  Award,
  Users,
  UsersRound,
  UserCheck,
}

interface TemplatePickerProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplatePicker({ isOpen, onClose }: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { setText } = useWorkspaceStore()

  const filteredTemplates = useMemo(() => {
    return textTemplates.filter((t) => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const handleSelectTemplate = (template: TextTemplate) => {
    setText(template.content, `${template.name}.txt`)
    onClose()
  }

  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName] || FileText
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-3xl max-h-[85vh]',
          'bg-white rounded-2xl shadow-2xl',
          'border border-stone-200',
          'flex flex-col overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <div
          className={cn(
            'shrink-0 px-6 py-5 border-b border-stone-200',
            'bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50'
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl',
                  'bg-gradient-to-br from-amber-500 to-orange-600',
                  'flex items-center justify-center',
                  'shadow-md shadow-amber-500/30'
                )}
              >
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">选择手写模板</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  共 {textTemplates.length} 个模板，一键加载后可自由编辑
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'w-9 h-9 rounded-xl',
                'flex items-center justify-center',
                'text-stone-400 hover:text-stone-600 hover:bg-stone-100',
                'transition-all duration-200'
              )}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板名称或描述..."
              className={cn(
                'w-full h-10 pl-10 pr-4 rounded-xl',
                'bg-white/80 border border-stone-200',
                'text-sm text-stone-700 placeholder:text-stone-400',
                'outline-none transition-all duration-200',
                'focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
              )}
            />
          </div>
        </div>

        <div className="shrink-0 px-6 py-3 border-b border-stone-100 bg-white/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            {templateCategories.map((cat) => {
              const CatIcon = getIcon(cat.iconName)
              const count =
                cat.id === 'all'
                  ? textTemplates.length
                  : textTemplates.filter((t) => t.category === cat.id).length
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'h-8 px-3 rounded-lg',
                    'flex items-center gap-1.5',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200/60'
                      : 'text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <CatIcon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.2 : 2} />
                  <span className="text-xs font-semibold">{cat.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-stone-200 text-stone-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl mb-4',
                  'bg-stone-100 flex items-center justify-center'
                )}
              >
                <Search className="w-8 h-8 text-stone-300" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-medium text-stone-500">没有找到匹配的模板</p>
              <p className="text-xs text-stone-400 mt-1">试试换个关键词吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => {
                const TplIcon = getIcon(template.iconName)
                const isHovered = hoveredId === template.id
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'group relative text-left',
                      'p-4 rounded-xl',
                      'border transition-all duration-200',
                      isHovered
                        ? 'border-amber-300 bg-gradient-to-br from-amber-50/80 to-orange-50/50 shadow-md shadow-amber-100/50 -translate-y-0.5'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'shrink-0 w-10 h-10 rounded-xl',
                          'flex items-center justify-center',
                          'transition-all duration-200',
                          isHovered
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-300'
                            : 'bg-stone-100 text-stone-500 group-hover:bg-amber-100 group-hover:text-amber-700'
                        )}
                      >
                        <TplIcon className="w-5 h-5" strokeWidth={isHovered ? 2.2 : 2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={cn(
                              'text-sm font-bold transition-colors duration-200',
                              isHovered ? 'text-amber-800' : 'text-stone-800'
                            )}
                          >
                            {template.name}
                          </h3>
                          <ChevronRight
                            className={cn(
                              'w-4 h-4 shrink-0 transition-all duration-200',
                              isHovered
                                ? 'text-amber-600 translate-x-0.5'
                                : 'text-stone-300 group-hover:text-stone-500'
                            )}
                            strokeWidth={2}
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="text-[10px] text-stone-400">
                            约 {template.content.length} 字
                          </span>
                          <span className="w-1 h-1 rounded-full bg-stone-200" />
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full font-medium',
                              template.category === 'letter' &&
                                'bg-blue-50 text-blue-600',
                              template.category === 'greeting' &&
                                'bg-pink-50 text-pink-600',
                              template.category === 'official' &&
                                'bg-violet-50 text-violet-600',
                              template.category === 'emotion' &&
                                'bg-rose-50 text-rose-600',
                              template.category === 'other' &&
                                'bg-stone-50 text-stone-600'
                            )}
                          >
                            {templateCategories.find((c) => c.id === template.category)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div
          className={cn(
            'shrink-0 px-6 py-3 border-t border-stone-100',
            'bg-stone-50/50',
            'flex items-center justify-between'
          )}
        >
          <p className="text-xs text-stone-400">
            💡 提示：选择模板后可在编辑器中修改占位符内容
          </p>
          <button
            onClick={onClose}
            className={cn(
              'h-8 px-4 rounded-lg',
              'text-xs font-medium',
              'text-stone-500 hover:text-stone-700 hover:bg-white',
              'border border-stone-200',
              'transition-all duration-200'
            )}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
