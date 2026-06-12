import { Pencil, HelpCircle, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  return (
    <header
      className={cn(
        'h-16 shrink-0',
        'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50',
        'border-b border-amber-200/80',
        'px-6 flex items-center justify-between',
        'shadow-[0_1px_0_rgba(0,0,0,0.02)]'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl',
            'bg-gradient-to-br from-amber-600 to-orange-700',
            'flex items-center justify-center',
            'shadow-md shadow-amber-500/20'
          )}
        >
          <Pencil className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex flex-col leading-tight">
          <h1
            className={cn(
              'text-xl font-bold',
              'text-amber-900',
              'tracking-wide'
            )}
          >
            手写字模拟器
          </h1>
          <span className="text-xs text-amber-700/70 font-medium">
            Handwriting Simulator
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className={cn(
            'w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            'text-amber-700 hover:text-amber-900',
            'hover:bg-amber-100/80',
            'transition-all duration-200',
            'group'
          )}
          title="使用帮助"
        >
          <HelpCircle
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            strokeWidth={2}
          />
        </button>

        <button
          className={cn(
            'w-10 h-10 rounded-lg',
            'flex items-center justify-center',
            'text-amber-700 hover:text-amber-900',
            'hover:bg-amber-100/80',
            'transition-all duration-200',
            'group'
          )}
          title="GitHub"
        >
          <Github
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            strokeWidth={2}
          />
        </button>
      </div>
    </header>
  )
}
