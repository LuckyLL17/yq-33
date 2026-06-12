import { useState } from 'react'
import { FileText, X, Sparkles, Hash, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { sampleText } from '@/constants/presets'

export default function TextEditor() {
  const [isFocused, setIsFocused] = useState(false)
  const { rawText, fileName, setText, clearText } = useWorkspaceStore()

  const charCount = rawText.length
  const lineCount = rawText ? rawText.split('\n').length : 0

  const handleLoadSample = () => {
    setText(sampleText, '示例文本.txt')
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value, fileName)
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
        <textarea
          value={rawText}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            '在此输入要转换为手写字的文本...\n\n支持中文、英文及标点符号。\n文字会实时渲染到右侧预览区域。'
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
            加载示例文本
          </button>
        </div>
      </div>
    </div>
  )
}
