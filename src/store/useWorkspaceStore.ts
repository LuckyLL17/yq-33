import { create } from 'zustand'

export interface FontPreset {
  id: string
  name: string
  fontFamily: string
  preview: string
}

export interface PaperPreset {
  id: string
  name: string
  bgColor: string
  lineColor: string
  lineSpacing: number
  hasLines: boolean
  hasMargin: boolean
}

interface WorkspaceState {
  rawText: string
  fileName: string
  activeTab: 'font' | 'paper' | 'layout'
  selectedFontId: string
  fontSize: number
  inkColor: string
  jitterAmount: number
  selectedPaperId: string
  paperBgColor: string
  paperLineColor: string
  paperLineSpacing: number
  showBindingLine: boolean
  letterSpacing: number
  lineHeight: number
  paragraphSpacing: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  zoomLevel: number
  currentPage: number
  totalPages: number

  setText: (text: string, fileName?: string) => void
  clearText: () => void
  setActiveTab: (tab: 'font' | 'paper' | 'layout') => void
  setSelectedFontId: (id: string) => void
  setFontSize: (size: number) => void
  setInkColor: (color: string) => void
  setJitterAmount: (amount: number) => void
  setSelectedPaperId: (id: string) => void
  setPaperBgColor: (color: string) => void
  setPaperLineColor: (color: string) => void
  setPaperLineSpacing: (spacing: number) => void
  setShowBindingLine: (show: boolean) => void
  setLetterSpacing: (spacing: number) => void
  setLineHeight: (height: number) => void
  setParagraphSpacing: (spacing: number) => void
  setMargins: (margins: { top?: number; right?: number; bottom?: number; left?: number }) => void
  setZoomLevel: (zoom: number) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  resetSettings: () => void
}

const defaultState = {
  rawText: '',
  fileName: '',
  activeTab: 'font' as const,
  selectedFontId: 'mashanzheng',
  fontSize: 24,
  inkColor: '#3a2e1f',
  jitterAmount: 0.55,
  selectedPaperId: 'grid',
  paperBgColor: '#fdf6e3',
  paperLineColor: '#c8c8c8',
  paperLineSpacing: 32,
  showBindingLine: false,
  letterSpacing: 0,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  marginTop: 40,
  marginRight: 40,
  marginBottom: 40,
  marginLeft: 50,
  zoomLevel: 1,
  currentPage: 1,
  totalPages: 1,
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...defaultState,

  setText: (text, fileName) =>
    set({ rawText: text, fileName: fileName || '' }),

  clearText: () =>
    set({ rawText: '', fileName: '' }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  setSelectedFontId: (id) =>
    set({ selectedFontId: id }),

  setFontSize: (size) =>
    set({ fontSize: size }),

  setInkColor: (color) =>
    set({ inkColor: color }),

  setJitterAmount: (amount) =>
    set({ jitterAmount: amount }),

  setSelectedPaperId: (id) =>
    set({ selectedPaperId: id }),

  setPaperBgColor: (color) =>
    set({ paperBgColor: color }),

  setPaperLineColor: (color) =>
    set({ paperLineColor: color }),

  setPaperLineSpacing: (spacing) =>
    set({ paperLineSpacing: spacing }),

  setShowBindingLine: (show) =>
    set({ showBindingLine: show }),

  setLetterSpacing: (spacing) =>
    set({ letterSpacing: spacing }),

  setLineHeight: (height) =>
    set({ lineHeight: height }),

  setParagraphSpacing: (spacing) =>
    set({ paragraphSpacing: spacing }),

  setMargins: (margins) =>
    set((state) => ({
      marginTop: margins.top ?? state.marginTop,
      marginRight: margins.right ?? state.marginRight,
      marginBottom: margins.bottom ?? state.marginBottom,
      marginLeft: margins.left ?? state.marginLeft,
    })),

  setZoomLevel: (zoom) =>
    set({ zoomLevel: Math.max(0.25, Math.min(3, zoom)) }),

  setCurrentPage: (page) =>
    set((state) => ({
      currentPage: Math.max(1, Math.min(state.totalPages, page)),
    })),

  setTotalPages: (pages) =>
    set({ totalPages: Math.max(1, pages) }),

  resetSettings: () =>
    set({
      selectedFontId: defaultState.selectedFontId,
      fontSize: defaultState.fontSize,
      inkColor: defaultState.inkColor,
      jitterAmount: defaultState.jitterAmount,
      selectedPaperId: defaultState.selectedPaperId,
      paperBgColor: defaultState.paperBgColor,
      paperLineColor: defaultState.paperLineColor,
      paperLineSpacing: defaultState.paperLineSpacing,
      showBindingLine: defaultState.showBindingLine,
      letterSpacing: defaultState.letterSpacing,
      lineHeight: defaultState.lineHeight,
      paragraphSpacing: defaultState.paragraphSpacing,
      marginTop: defaultState.marginTop,
      marginRight: defaultState.marginRight,
      marginBottom: defaultState.marginBottom,
      marginLeft: defaultState.marginLeft,
      zoomLevel: defaultState.zoomLevel,
    }),
}))
