import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WorkspaceLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  className?: string
}

export default function WorkspaceLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  className,
}: WorkspaceLayoutProps) {
  return (
    <div
      className={cn(
        'flex h-[calc(100vh-4rem)] min-h-0',
        'bg-stone-100/50',
        className
      )}
    >
      <aside
        className={cn(
          'w-[26rem] shrink-0 min-w-[26rem]',
          'border-r border-stone-200',
          'bg-white/70 backdrop-blur-sm',
          'overflow-y-auto',
          'hidden xl:block'
        )}
      >
        {leftPanel}
      </aside>

      <main
        className={cn(
          'flex-1 min-w-0',
          'flex flex-col',
          'border-r border-stone-200',
          'overflow-hidden'
        )}
      >
        {centerPanel}
      </main>

      <section
        className={cn(
          'hidden md:flex flex-col',
          'flex-[1.2] min-w-0',
          'overflow-hidden',
          'bg-gradient-to-br from-stone-50 to-amber-50/30'
        )}
      >
        {rightPanel}
      </section>
    </div>
  )
}
