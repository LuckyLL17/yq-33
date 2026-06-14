import { useState, useRef } from 'react'
import { 
  FileText, X, Sparkles, Hash, AlignLeft, BookTemplate,
  Bold, Italic, Strikethrough, Quote, List, ListOrdered,
  Type, Heading1, Heading2, Heading3, Code, ToggleLeft, ToggleRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { sampleText } from '@/constants/presets'
import TemplatePicker from '@/components/templates/TemplatePicker'

const sampleMarkdownText = `# 手写字模拟器

欢迎使用 **手写字模拟器**！这是一个支持 *Markdown* 格式的文本编辑器。

## 功能特点

- 支持多种手写字体
- 实时预览手写效果
- ~~普通文本~~ **Markdown 格式**
- 丰富的纸张样式

### 引用示例

> 生活不止眼前的苟且，还有诗和远方。
> —— 高晓松

## 有序列表

1. 输入文本内容
2. 选择手写字体
3. 调整纸张样式
4. 导出为图片

## 代码示例

使用 \`markdownEnabled\` 开启 Markdown 渲染。

---

**祝使用愉快！** 🎉`

export default function TextEditor() {
  const [isFocused, setIsFocused] = useState(false)
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { rawText, fileName, setText, clearText, markdownEnabled, setMarkdownEnabled } = useWorkspaceStore()

  const charCount = rawText.length
  const lineCount = rawText ? rawText.split('\n').length : 0

  const handleLoadSample = () => {
    if (markdownEnabled) {
      setText(sampleMarkdownText, '示例 Markdown.md')
    } else {
      setText(sampleText, '示例文本.txt')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value, fileName)
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = rawText.substring(start, end)
    const newText = rawText.substring(0, start) + before + selectedText + after + rawText.substring(end)
    
    setText(newText, fileName)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertHeading = (level: number) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = rawText.lastIndexOf('\n', start - 1) + 1
    const prefix = '#'.repeat(level) + ' '
    
    const newText = rawText.substring(0, lineStart) + prefix + rawText.substring(lineStart)
    setText(newText, fileName)
    
    setTimeout(() => {
      textarea.focus()
      const newPos = start + prefix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const insertBlockquote = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = rawText.lastIndexOf('\n', start - 1) + 1
    
    const newText = rawText.substring(0, lineStart) + '> ' + rawText.substring(lineStart)
    setText(newText, fileName)
    
    setTimeout(() => {
      textarea.focus()
      const newPos = start + 2
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const insertList = (ordered: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = rawText.lastIndexOf('\n', start - 1) + 1
    const prefix = ordered ? '1. ' : '- '
    
    const newText = rawText.substring(0, lineStart) + prefix + rawText.substring(lineStart)
    setText(newText, fileName)
    
    setTimeout(() => {
      textarea.focus()
      const newPos = start + prefix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const toggleMarkdown = () => {
    setMarkdownEnabled(!markdownEnabled)
  }

  return (
    <div className={cn('flex-1 min-h-0 flex flex-col p-5 pt-0', 'gap-4')}>
      <div
        className={cn(
          'flex items-center justify-between',
          'h-11 shrink-0',
          'rounded-xl',
          'bg-white border border-stone-200',
          'px-4',
          'shadow-sm',
          fileName ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              'w-7 h-7 rounded-lg shrink-0',
              'flex items-center justify-center',
              fileName
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                : 'bg-stone-100 text-stone-400'
            )}
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            {fileName ? (
              <p
                className={cn(
                  'text-sm font-medium text-stone-800',
                  'truncate max-w-[200px]'
                )}
              >
                {fileName}
              </p>
            ) : (
              <p className="text-sm text-stone-400">未选择文件</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMarkdown}
            className={cn(
              'flex items-center gap-1.5',
              'h-7 px-2.5 rounded-lg',
              'text-xs font-medium',
              'transition-all duration-200',
              'active:scale-[0.97]',
              markdownEnabled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200/50'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
            title={markdownEnabled ? '关闭 Markdown 模式' : '开启 Markdown 模式'}
          >
            {markdownEnabled ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Markdown</span>
          </button>

          {fileName && (
            <button
              onClick={clearText}
              className={cn(
                'w-7 h-7 rounded-lg',
                'flex items-center justify-center',
                'text-stone-400 hover:text-red-500 hover:bg-red-50',
                'transition-all duration-200'
              )}
              title="清除内容"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex-1 min-h-0',
          'relative rounded-xl',
          'bg-white border',
          'transition-all duration-200',
          'overflow-hidden flex flex-col',
          isFocused
            ? 'border-amber-400 ring-2 ring-amber-100 shadow-md shadow-amber-50'
            : 'border-stone-200 shadow-sm'
        )}
      >
        {markdownEnabled && (
          <div className="flex items-center gap-1 px-3 py-2 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => insertHeading(1)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="一级标题"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertHeading(2)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="二级标题"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertHeading(3)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="三级标题"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-stone-200 mx-1" />

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => insertMarkdown('**', '**')}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="加粗"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('*', '*')}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="斜体"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('~~', '~~')}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="删除线"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('`', '`')}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="行内代码"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-stone-200 mx-1" />

            <div className="flex items-center gap-0.5">
              <button
                onClick={insertBlockquote}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="引用块"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertList(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="无序列表"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertList(true)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-stone-600 hover:bg-white hover:text-amber-700 transition-colors"
                title="有序列表"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-stone-200 mx-1" />

            <span className="text-xs text-stone-400 ml-1">
              Markdown 格式
            </span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            markdownEnabled
              ? '在此输入 Markdown 格式的文本...\n\n支持标题、加粗、斜体、引用、列表等格式。\n文字会实时渲染为手写效果到右侧预览区域。'
              : '在此输入要转换为手写字的文本...\n\n支持中文、英文及标点符号。\n文字会实时渲染到右侧预览区域。'
          }
          className={cn(
            'flex-1 w-full resize-none outline-none',
            'p-5',
            'text-[15px] leading-relaxed text-stone-800',
            'placeholder:text-stone-300',
            'font-serif'
          )}
        />

        <div
          className={cn(
            'shrink-0',
            'h-11 border-t border-stone-100',
            'px-4 flex items-center justify-between'
          )}
        >
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-stone-500">
              <Hash className="w-3.5 h-3.5" />
              <span className="font-medium text-stone-700">{charCount}</span>
              <span className="text-stone-400">字</span>
            </span>
            <span className="w-px h-3 bg-stone-200" />
            <span className="flex items-center gap-1.5 text-stone-500">
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="font-medium text-stone-700">{lineCount}</span>
              <span className="text-stone-400">行</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTemplatePickerOpen(true)}
              className={cn(
                'flex items-center gap-1.5',
                'h-7 px-3 rounded-lg',
                'text-xs font-medium',
                'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
                'hover:from-violet-600 hover:to-purple-600',
                'shadow-sm shadow-violet-200/50',
                'transition-all duration-200',
                'active:scale-[0.97]'
              )}
            >
              <BookTemplate className="w-3.5 h-3.5" />
              选择模板
            </button>
            <button
              onClick={handleLoadSample}
              className={cn(
                'flex items-center gap-1.5',
                'h-7 px-3 rounded-lg',
                'text-xs font-medium',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                'hover:from-amber-600 hover:to-orange-600',
                'shadow-sm shadow-amber-200/50',
                'transition-all duration-200',
                'active:scale-[0.97]'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              示例文本
            </button>
          </div>
        </div>
      </div>

      <TemplatePicker
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
      />
    </div>
  )
}
