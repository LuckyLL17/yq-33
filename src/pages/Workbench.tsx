import { useRef } from 'react'
import { Type, StickyNote, LayoutGrid, PenTool, Stamp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import Header from '@/components/layout/Header'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import FileUploader from '@/components/upload/FileUploader'
import TextEditor from '@/components/editor/TextEditor'
import FontSettings from '@/components/settings/FontSettings'
import PaperSettings from '@/components/settings/PaperSettings'
import LayoutSettings from '@/components/settings/LayoutSettings'
import SignaturePanel from '@/components/signature/SignaturePanel'
import StampPanel from '@/components/signature/StampPanel'
import HandwritingPreview from '@/components/preview/HandwritingPreview'
import ExportActions from '@/components/export/ExportActions'

const tabs = [
  {
    id: 'font' as const,
    label: '字体',
    icon: Type,
  },
  {
    id: 'paper' as const,
    label: '信纸',
    icon: StickyNote,
  },
  {
    id: 'layout' as const,
    label: '排版',
    icon: LayoutGrid,
  },
  {
    id: 'signature' as const,
    label: '签名',
    icon: PenTool,
  },
  {
    id: 'stamp' as const,
    label: '印章',
    icon: Stamp,
  },
]

export default function Workbench() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activeTab, setActiveTab } = useWorkspaceStore()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'font':
        return <FontSettings />
      case 'paper':
        return <PaperSettings />
      case 'layout':
        return <LayoutSettings />
      case 'signature':
        return <SignaturePanel />
      case 'stamp':
        return <StampPanel />
      default:
        return <FontSettings />
    }
  }

  const leftPanel = (
    <div className="flex h-full">
      <nav
        className={cn(
          'w-14 shrink-0',
          'flex flex-col items-center gap-1',
          'py-4',
          'border-r border-stone-200/80',
          'bg-gradient-to-b from-stone-50/50 to-amber-50/30'
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative',
                'flex flex-col items-center justify-center gap-0.5',
                'w-12 h-16 rounded-xl',
                'transition-all duration-300 ease-out',
                'group',
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 scale-105'
                  : 'text-stone-500 hover:text-amber-700 hover:bg-amber-50'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )}
                strokeWidth={isActive ? 2.2 : 2}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold leading-none',
                  isActive ? 'text-white/95' : 'text-stone-500 group-hover:text-amber-700'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
    </div>
  )

  const centerPanel = (
    <div className="flex flex-col h-full min-h-0">
      <FileUploader />
      <TextEditor />
    </div>
  )

  const rightPanel = (
    <div className="flex flex-col h-full min-h-0">
      <HandwritingPreview ref={canvasRef} />
      <ExportActions canvasRef={canvasRef} />
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <WorkspaceLayout
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
      />
    </div>
  )
}
