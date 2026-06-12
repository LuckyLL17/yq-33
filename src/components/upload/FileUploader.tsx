import { useState, useRef, useCallback } from 'react'
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFileParser } from '@/hooks/useFileParser'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isLoading, progress, error, parseFile } = useFileParser()
  const setText = useWorkspaceStore((s) => s.setText)

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const text = await parseFile(file)
        setText(text, file.name)
      } catch (err) {
        console.error('文件处理失败:', err)
      }
    },
    [parseFile, setText]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }, [isLoading])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div className="p-5">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          'relative cursor-pointer select-none',
          'rounded-2xl border-2 border-dashed',
          'p-8 text-center',
          'transition-all duration-300 ease-out',
          isDragging
            ? 'border-amber-500 bg-amber-50/80 scale-[1.01] shadow-lg shadow-amber-200/50'
            : 'border-stone-300 bg-white hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-md',
          isLoading && 'pointer-events-none opacity-90'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl',
              'flex items-center justify-center',
              'transition-all duration-300',
              isDragging
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-110 shadow-lg'
                : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <UploadCloud className="w-8 h-8" strokeWidth={1.8} />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <p
              className={cn(
                'text-base font-semibold',
                isDragging ? 'text-amber-700' : 'text-stone-700'
              )}
            >
              {isLoading
                ? '正在解析文件...'
                : isDragging
                ? '松开鼠标上传文件'
                : error
                ? '上传失败，请重试'
                : '拖拽文件到此处，或点击选择'}
            </p>
            <p className="text-sm text-stone-500">
              支持 .txt, .docx, .pdf 格式
            </p>
          </div>

          {isLoading && (
            <div className="w-full max-w-xs">
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">{progress}%</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                TXT
              </span>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                DOCX
              </span>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                PDF
              </span>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>文件内容将自动加密处理，不会上传至服务器</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
