import { forwardRef } from 'react'
import { Image, FileText, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { useExport } from '@/hooks/useExport'

interface ExportActionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

const ExportActions = forwardRef<HTMLDivElement, ExportActionsProps>(
  ({ canvasRef }, ref) => {
    const resetSettings = useWorkspaceStore((s) => s.resetSettings)
    const { isExporting, exportProgress, exportPNG, exportPDF } =
      useExport(canvasRef)

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0',
          'h-16',
          'border-t border-stone-200',
          'bg-white/80 backdrop-blur-sm',
          'px-4 flex items-center justify-between',
          'gap-3'
        )}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (confirm('确定要重置所有设置吗？')) {
                resetSettings()
              }
            }}
            className={cn(
              'flex items-center gap-1.5',
              'h-9 px-3.5 rounded-xl',
              'text-sm font-medium',
              'text-stone-600 hover:text-stone-800',
              'hover:bg-stone-100',
              'border border-stone-200',
              'transition-all duration-200',
              'active:scale-[0.97]',
              isExporting && 'opacity-50 pointer-events-none'
            )}
          >
            <RotateCcw className="w-4 h-4" />
            重置设置
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isExporting && (
            <div
              className={cn(
                'flex items-center gap-2',
                'h-9 px-3 rounded-xl',
                'bg-amber-50 border border-amber-200'
              )}
            >
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-xs font-medium text-amber-700">
                导出中 {exportProgress}%
              </span>
            </div>
          )}

          <button
            onClick={exportPNG}
            disabled={isExporting}
            className={cn(
              'group relative overflow-hidden',
              'flex items-center gap-1.5',
              'h-9 px-4 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-gradient-to-r from-emerald-500 to-teal-600',
              'hover:from-emerald-600 hover:to-teal-700',
              'shadow-md shadow-emerald-500/25',
              'transition-all duration-200',
              'active:scale-[0.97]',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'disabled:active:scale-100'
            )}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            <Image className="w-4 h-4 relative z-10" />
            <span className="relative z-10">导出PNG</span>
          </button>

          <button
            onClick={exportPDF}
            disabled={isExporting}
            className={cn(
              'group relative overflow-hidden',
              'flex items-center gap-1.5',
              'h-9 px-4 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-gradient-to-r from-amber-500 to-orange-600',
              'hover:from-amber-600 hover:to-orange-700',
              'shadow-md shadow-amber-500/25',
              'transition-all duration-200',
              'active:scale-[0.97]',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'disabled:active:scale-100'
            )}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            <FileText className="w-4 h-4 relative z-10" />
            <span className="relative z-10">导出PDF</span>
          </button>
        </div>
      </div>
    )
  }
)

ExportActions.displayName = 'ExportActions'

export default ExportActions
