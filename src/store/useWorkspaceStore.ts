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

interface Signature {
  id: string
  name: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
  bgOpacity: number
  paperId: string
  paperBgColor: string
  paperLineColor: string
  paperLineSpacing: number
  paperType: string
}

interface SignaturePlacement {
  signatureId: string
  pageIndex: number
  x: number
  y: number
  scale: number
}

interface WorkspaceState {
  rawText: string
  fileName: string
  activeTab: 'font' | 'paper' | 'layout' | 'signature'
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
  signatures: Signature[]
  signaturePlacements: SignaturePlacement[]
  selectedSignatureId: string | null
  isPlacingSignature: boolean

  setText: (text: string, fileName?: string) => void
  clearText: () => void
  setActiveTab: (tab: 'font' | 'paper' | 'layout' | 'signature') => void
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
  addSignature: (signature: Omit<Signature, 'id' | 'createdAt'>) => void
  deleteSignature: (id: string) => void
  updateSignatureName: (id: string, name: string) => void
  updateSignatureBgOpacity: (id: string, bgOpacity: number) => void
  setSelectedSignatureId: (id: string | null) => void
  addSignaturePlacement: (placement: SignaturePlacement) => void
  updateSignaturePlacement: (index: number, placement: Partial<SignaturePlacement>) => void
  deleteSignaturePlacement: (index: number) => void
  setIsPlacingSignature: (placing: boolean) => void
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
  signatures: [] as Signature[],
  signaturePlacements: [] as SignaturePlacement[],
  selectedSignatureId: null as string | null,
  isPlacingSignature: false,
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

  addSignature: (signature) =>
    set((state) => ({
      signatures: [
        ...state.signatures,
        {
          ...signature,
          bgOpacity: signature.bgOpacity ?? 0,
          id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: Date.now(),
        },
      ],
    })),

  deleteSignature: (id) =>
    set((state) => ({
      signatures: state.signatures.filter((s) => s.id !== id),
      signaturePlacements: state.signaturePlacements.filter((p) => p.signatureId !== id),
      selectedSignatureId: state.selectedSignatureId === id ? null : state.selectedSignatureId,
    })),

  updateSignatureName: (id, name) =>
    set((state) => ({
      signatures: state.signatures.map((s) =>
        s.id === id ? { ...s, name } : s
      ),
    })),

  updateSignatureBgOpacity: (id, bgOpacity) =>
    set((state) => ({
      signatures: state.signatures.map((s) =>
        s.id === id ? { ...s, bgOpacity: Math.max(0, Math.min(1, bgOpacity)) } : s
      ),
    })),

  setSelectedSignatureId: (id) =>
    set({ selectedSignatureId: id }),

  addSignaturePlacement: (placement) =>
    set((state) => ({
      signaturePlacements: [...state.signaturePlacements, placement],
      isPlacingSignature: false,
      selectedSignatureId: null,
    })),

  updateSignaturePlacement: (index, placement) =>
    set((state) => ({
      signaturePlacements: state.signaturePlacements.map((p, i) =>
        i === index ? { ...p, ...placement } : p
      ),
    })),

  deleteSignaturePlacement: (index) =>
    set((state) => ({
      signaturePlacements: state.signaturePlacements.filter((_, i) => i !== index),
    })),

  setIsPlacingSignature: (placing) =>
    set({ isPlacingSignature: placing }),
}))
