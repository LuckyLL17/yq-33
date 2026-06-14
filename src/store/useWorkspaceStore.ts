import { create } from 'zustand'
import type {
  DecorationCategory,
  DecorationPreset,
  DecorationPlacement,
  FilterType,
  FilterPreset,
  FontPreset,
  FontCategory,
  FontSource,
  JitterSettings,
} from '@/types'

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

export type StampShape = 'circle' | 'square' | 'ellipse'
export type StampBorderStyle = 'solid' | 'double' | 'dashed' | 'none'

export type AnnotationTool = 'pen' | 'highlighter' | 'circle' | 'rect' | 'line' | 'underline' | 'wavy' | 'arrow' | 'text' | 'eraser'
export type AnnotationItemType = 'path' | 'highlight' | 'circle' | 'rect' | 'line' | 'underline' | 'wavy' | 'arrow' | 'text'

export interface AnnotationStyle {
  color: string
  strokeWidth: number
  fillColor?: string
  opacity: number
  fontFamily?: string
  fontSize?: number
}

export interface BaseAnnotation {
  id: string
  type: AnnotationItemType
  pageIndex: number
  style: AnnotationStyle
  createdAt: number
}

export interface PathAnnotation extends BaseAnnotation {
  type: 'path' | 'highlight'
  points: { x: number; y: number }[]
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'circle' | 'rect'
  x: number
  y: number
  width: number
  height: number
}

export interface LineAnnotation extends BaseAnnotation {
  type: 'line' | 'arrow'
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface UnderlineAnnotation extends BaseAnnotation {
  type: 'underline' | 'wavy'
  x: number
  y: number
  width: number
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text'
  x: number
  y: number
  text: string
}

export type Annotation = PathAnnotation | ShapeAnnotation | LineAnnotation | UnderlineAnnotation | TextAnnotation

export interface AnnotationPreset {
  id: string
  name: string
  tool: AnnotationTool
  style: AnnotationStyle
}

export interface Stamp {
  id: string
  name: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
  bgOpacity: number
  config: StampConfig
}

export interface StampConfig {
  shape: StampShape
  topText: string
  centerText: string
  bottomText: string
  fontFamily: string
  fontSize: number
  color: string
  borderWidth: number
  borderStyle: StampBorderStyle
  size: number
  rotation: number
  starSize: number
  showStar: boolean
  innerPadding: number
}

export interface StampPlacement {
  stampId: string
  pageIndex: number
  x: number
  y: number
  scale: number
}

interface WorkspaceState {
  rawText: string
  fileName: string
  markdownEnabled: boolean
  activeTab: 'font' | 'paper' | 'layout' | 'signature' | 'stamp' | 'annotation' | 'decoration' | 'filter'
  selectedFontId: string
  fontSize: number
  inkColor: string
  jitterAmount: number
  jitterPositionX: number
  jitterPositionY: number
  jitterSize: number
  jitterRotation: number
  jitterBaseline: number
  jitterInkDensity: number
  jitterInkColor: number
  jitterSpacing: number
  jitterLineDrift: number
  jitterLineTilt: number
  jitterHalo: number
  jitterDryBrush: number
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
  isDirectSigning: boolean
  stamps: Stamp[]
  stampPlacements: StampPlacement[]
  selectedStampId: string | null
  isPlacingStamp: boolean
  annotations: Annotation[]
  selectedAnnotationId: string | null
  isAnnotating: boolean
  activeAnnotationTool: AnnotationTool
  annotationStyle: AnnotationStyle
  annotationPresets: AnnotationPreset[]
  decorationCategory: DecorationCategory
  selectedDecorationId: string | null
  isPlacingDecoration: boolean
  decorationPlacements: DecorationPlacement[]
  selectedDecorationPlacementId: string | null
  activeFilter: FilterType
  filterIntensity: number
  filterPresets: FilterPreset[]
  customFonts: FontPreset[]
  fontSearchQuery: string
  fontCategoryFilter: FontCategory | 'all'
  fontSourceFilter: FontSource | 'all'

  setText: (text: string, fileName?: string) => void
  clearText: () => void
  setActiveTab: (tab: 'font' | 'paper' | 'layout' | 'signature' | 'stamp' | 'annotation' | 'decoration' | 'filter') => void
  setSelectedFontId: (id: string) => void
  setFontSize: (size: number) => void
  setInkColor: (color: string) => void
  setJitterAmount: (amount: number) => void
  setJitterPositionX: (value: number) => void
  setJitterPositionY: (value: number) => void
  setJitterSize: (value: number) => void
  setJitterRotation: (value: number) => void
  setJitterBaseline: (value: number) => void
  setJitterInkDensity: (value: number) => void
  setJitterInkColor: (value: number) => void
  setJitterSpacing: (value: number) => void
  setJitterLineDrift: (value: number) => void
  setJitterLineTilt: (value: number) => void
  setJitterHalo: (value: number) => void
  setJitterDryBrush: (value: number) => void
  setJitterSettings: (settings: Partial<JitterSettings>) => void
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
  setMarkdownEnabled: (enabled: boolean) => void
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
  setIsDirectSigning: (signing: boolean) => void
  addStamp: (stamp: Omit<Stamp, 'id' | 'createdAt'>) => void
  deleteStamp: (id: string) => void
  updateStampName: (id: string, name: string) => void
  updateStampBgOpacity: (id: string, bgOpacity: number) => void
  setSelectedStampId: (id: string | null) => void
  addStampPlacement: (placement: StampPlacement) => void
  updateStampPlacement: (index: number, placement: Partial<StampPlacement>) => void
  deleteStampPlacement: (index: number) => void
  setIsPlacingStamp: (placing: boolean) => void
  addAnnotation: (annotation: any) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
  clearPageAnnotations: (pageIndex: number) => void
  clearAllAnnotations: () => void
  setSelectedAnnotationId: (id: string | null) => void
  setIsAnnotating: (annotating: boolean) => void
  setActiveAnnotationTool: (tool: AnnotationTool) => void
  setAnnotationStyle: (style: Partial<AnnotationStyle>) => void
  addAnnotationPreset: (preset: Omit<AnnotationPreset, 'id'>) => void
  deleteAnnotationPreset: (id: string) => void
  loadAnnotations: (annotations: Annotation[]) => void
  setDecorationCategory: (category: DecorationCategory) => void
  setSelectedDecorationId: (id: string | null) => void
  setIsPlacingDecoration: (placing: boolean) => void
  addDecorationPlacement: (placement: Omit<DecorationPlacement, 'id'>) => void
  updateDecorationPlacement: (id: string, updates: Partial<DecorationPlacement>) => void
  deleteDecorationPlacement: (id: string) => void
  setSelectedDecorationPlacementId: (id: string | null) => void
  clearPageDecorations: (pageIndex: number) => void
  clearAllDecorations: () => void
  setActiveFilter: (filter: FilterType) => void
  setFilterIntensity: (intensity: number) => void
  addCustomFont: (font: Omit<FontPreset, 'id' | 'isBuiltIn' | 'source' | 'createdAt'> & { source?: FontSource }) => void
  deleteCustomFont: (id: string) => void
  updateCustomFont: (id: string, updates: Partial<FontPreset>) => void
  setFontSearchQuery: (query: string) => void
  setFontCategoryFilter: (category: FontCategory | 'all') => void
  setFontSourceFilter: (source: FontSource | 'all') => void
}

const defaultState = {
  rawText: '',
  fileName: '',
  markdownEnabled: true,
  activeTab: 'font' as const,
  selectedFontId: 'ma-shan-zheng',
  fontSize: 24,
  inkColor: '#3a2e1f',
  jitterAmount: 0.55,
  jitterPositionX: 0.6,
  jitterPositionY: 0.6,
  jitterSize: 0.5,
  jitterRotation: 0.5,
  jitterBaseline: 0.5,
  jitterInkDensity: 0.5,
  jitterInkColor: 0.4,
  jitterSpacing: 0.5,
  jitterLineDrift: 0.4,
  jitterLineTilt: 0.3,
  jitterHalo: 0.3,
  jitterDryBrush: 0.3,
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
  isDirectSigning: false,
  stamps: [] as Stamp[],
  stampPlacements: [] as StampPlacement[],
  selectedStampId: null as string | null,
  isPlacingStamp: false,
  annotations: [] as Annotation[],
  selectedAnnotationId: null as string | null,
  isAnnotating: false,
  activeAnnotationTool: 'pen' as AnnotationTool,
  annotationStyle: {
    color: '#e53935',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 20,
    fontFamily: '"Ma Shan Zheng", "KaiTi", cursive, serif',
  } as AnnotationStyle,
  annotationPresets: [
    {
      id: 'preset_red_pen',
      name: '红笔批注',
      tool: 'pen',
      style: { color: '#e53935', strokeWidth: 2, opacity: 1 },
    },
    {
      id: 'preset_blue_pen',
      name: '蓝笔批注',
      tool: 'pen',
      style: { color: '#1e88e5', strokeWidth: 2, opacity: 1 },
    },
    {
      id: 'preset_yellow_highlight',
      name: '黄色荧光',
      tool: 'highlighter',
      style: { color: '#ffeb3b', strokeWidth: 14, opacity: 0.5 },
    },
    {
      id: 'preset_green_highlight',
      name: '绿色荧光',
      tool: 'highlighter',
      style: { color: '#81c784', strokeWidth: 14, opacity: 0.5 },
    },
    {
      id: 'preset_red_circle',
      name: '红圈重点',
      tool: 'circle',
      style: { color: '#e53935', strokeWidth: 2.5, opacity: 1 },
    },
    {
      id: 'preset_red_underline',
      name: '红色下划线',
      tool: 'underline',
      style: { color: '#e53935', strokeWidth: 2, opacity: 1 },
    },
  ] as AnnotationPreset[],
  decorationCategory: 'tape' as DecorationCategory,
  selectedDecorationId: null as string | null,
  isPlacingDecoration: false,
  decorationPlacements: [] as DecorationPlacement[],
  selectedDecorationPlacementId: null as string | null,
  activeFilter: 'none' as FilterType,
  filterIntensity: 0.6,
  filterPresets: [
    { id: 'none', name: '无滤镜', description: '保持原始手写效果', intensity: 0 },
    { id: 'inkBleed', name: '墨迹晕染', description: '墨水渗透纸张的晕染效果', intensity: 0.6 },
    { id: 'pencilSketch', name: '铅笔素描', description: '细腻的铅笔素描质感', intensity: 0.6 },
    { id: 'penStroke', name: '钢笔笔触', description: '经典钢笔书写效果', intensity: 0.6 },
    { id: 'brushStroke', name: '毛笔笔触', description: '毛笔书法的笔触效果', intensity: 0.6 },
    { id: 'watercolor', name: '水彩渲染', description: '水彩画的柔和渲染', intensity: 0.6 },
    { id: 'carbonCopy', name: '复写纸', description: '蓝色复写纸的复古效果', intensity: 0.6 },
    { id: 'fountainPen', name: '钢笔墨痕', description: '老式钢笔的墨迹效果', intensity: 0.6 },
    { id: 'crayon', name: '蜡笔涂鸦', description: '蜡笔的粗糙质感', intensity: 0.6 },
    { id: 'marker', name: '马克笔', description: '马克笔的鲜艳笔触', intensity: 0.6 },
  ] as FilterPreset[],
  customFonts: [] as FontPreset[],
  fontSearchQuery: '',
  fontCategoryFilter: 'all' as FontCategory | 'all',
  fontSourceFilter: 'all' as FontSource | 'all',
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

  setJitterPositionX: (value) =>
    set({ jitterPositionX: Math.max(0, Math.min(1, value)) }),

  setJitterPositionY: (value) =>
    set({ jitterPositionY: Math.max(0, Math.min(1, value)) }),

  setJitterSize: (value) =>
    set({ jitterSize: Math.max(0, Math.min(1, value)) }),

  setJitterRotation: (value) =>
    set({ jitterRotation: Math.max(0, Math.min(1, value)) }),

  setJitterBaseline: (value) =>
    set({ jitterBaseline: Math.max(0, Math.min(1, value)) }),

  setJitterInkDensity: (value) =>
    set({ jitterInkDensity: Math.max(0, Math.min(1, value)) }),

  setJitterInkColor: (value) =>
    set({ jitterInkColor: Math.max(0, Math.min(1, value)) }),

  setJitterSpacing: (value) =>
    set({ jitterSpacing: Math.max(0, Math.min(1, value)) }),

  setJitterLineDrift: (value) =>
    set({ jitterLineDrift: Math.max(0, Math.min(1, value)) }),

  setJitterLineTilt: (value) =>
    set({ jitterLineTilt: Math.max(0, Math.min(1, value)) }),

  setJitterHalo: (value) =>
    set({ jitterHalo: Math.max(0, Math.min(1, value)) }),

  setJitterDryBrush: (value) =>
    set({ jitterDryBrush: Math.max(0, Math.min(1, value)) }),

  setJitterSettings: (settings) =>
    set((state) => ({
      jitterPositionX: settings.positionX ?? state.jitterPositionX,
      jitterPositionY: settings.positionY ?? state.jitterPositionY,
      jitterSize: settings.size ?? state.jitterSize,
      jitterRotation: settings.rotation ?? state.jitterRotation,
      jitterBaseline: settings.baseline ?? state.jitterBaseline,
      jitterInkDensity: settings.inkDensity ?? state.jitterInkDensity,
      jitterInkColor: settings.inkColor ?? state.jitterInkColor,
      jitterSpacing: settings.spacing ?? state.jitterSpacing,
      jitterLineDrift: settings.lineDrift ?? state.jitterLineDrift,
      jitterLineTilt: settings.lineTilt ?? state.jitterLineTilt,
      jitterHalo: settings.halo ?? state.jitterHalo,
      jitterDryBrush: settings.dryBrush ?? state.jitterDryBrush,
    })),

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

  setMarkdownEnabled: (enabled) =>
    set({ markdownEnabled: enabled }),

  resetSettings: () =>
    set({
      selectedFontId: defaultState.selectedFontId,
      fontSize: defaultState.fontSize,
      inkColor: defaultState.inkColor,
      jitterAmount: defaultState.jitterAmount,
      jitterPositionX: defaultState.jitterPositionX,
      jitterPositionY: defaultState.jitterPositionY,
      jitterSize: defaultState.jitterSize,
      jitterRotation: defaultState.jitterRotation,
      jitterBaseline: defaultState.jitterBaseline,
      jitterInkDensity: defaultState.jitterInkDensity,
      jitterInkColor: defaultState.jitterInkColor,
      jitterSpacing: defaultState.jitterSpacing,
      jitterLineDrift: defaultState.jitterLineDrift,
      jitterLineTilt: defaultState.jitterLineTilt,
      jitterHalo: defaultState.jitterHalo,
      jitterDryBrush: defaultState.jitterDryBrush,
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

  setIsDirectSigning: (signing) =>
    set({ isDirectSigning: signing }),

  addStamp: (stamp) =>
    set((state) => ({
      stamps: [
        ...state.stamps,
        {
          ...stamp,
          bgOpacity: stamp.bgOpacity ?? 0,
          id: `stamp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: Date.now(),
        },
      ],
    })),

  deleteStamp: (id) =>
    set((state) => ({
      stamps: state.stamps.filter((s) => s.id !== id),
      stampPlacements: state.stampPlacements.filter((p) => p.stampId !== id),
      selectedStampId: state.selectedStampId === id ? null : state.selectedStampId,
    })),

  updateStampName: (id, name) =>
    set((state) => ({
      stamps: state.stamps.map((s) =>
        s.id === id ? { ...s, name } : s
      ),
    })),

  updateStampBgOpacity: (id, bgOpacity) =>
    set((state) => ({
      stamps: state.stamps.map((s) =>
        s.id === id ? { ...s, bgOpacity: Math.max(0, Math.min(1, bgOpacity)) } : s
      ),
    })),

  setSelectedStampId: (id) =>
    set({ selectedStampId: id }),

  addStampPlacement: (placement) =>
    set((state) => ({
      stampPlacements: [...state.stampPlacements, placement],
      isPlacingStamp: false,
      selectedStampId: null,
    })),

  updateStampPlacement: (index, placement) =>
    set((state) => ({
      stampPlacements: state.stampPlacements.map((p, i) =>
        i === index ? { ...p, ...placement } : p
      ),
    })),

  deleteStampPlacement: (index) =>
    set((state) => ({
      stampPlacements: state.stampPlacements.filter((_, i) => i !== index),
    })),

  setIsPlacingStamp: (placing) =>
    set({ isPlacingStamp: placing }),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [
        ...state.annotations,
        {
          ...annotation,
          id: `anno_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: Date.now(),
        } as Annotation,
      ],
    })),

  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? ({ ...a, ...updates } as Annotation) : a
      ),
    })),

  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
    })),

  clearPageAnnotations: (pageIndex) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.pageIndex !== pageIndex),
    })),

  clearAllAnnotations: () =>
    set({ annotations: [], selectedAnnotationId: null }),

  setSelectedAnnotationId: (id) =>
    set({ selectedAnnotationId: id }),

  setIsAnnotating: (annotating) =>
    set({ isAnnotating: annotating }),

  setActiveAnnotationTool: (tool) =>
    set({ activeAnnotationTool: tool }),

  setAnnotationStyle: (style) =>
    set((state) => ({
      annotationStyle: { ...state.annotationStyle, ...style },
    })),

  addAnnotationPreset: (preset) =>
    set((state) => ({
      annotationPresets: [
        ...state.annotationPresets,
        {
          ...preset,
          id: `apreset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        },
      ],
    })),

  deleteAnnotationPreset: (id) =>
    set((state) => ({
      annotationPresets: state.annotationPresets.filter((p) => p.id !== id),
    })),

  loadAnnotations: (annotations) =>
    set({ annotations }),

  setDecorationCategory: (category) =>
    set({ decorationCategory: category }),

  setSelectedDecorationId: (id) =>
    set({ selectedDecorationId: id }),

  setIsPlacingDecoration: (placing) =>
    set({ isPlacingDecoration: placing }),

  addDecorationPlacement: (placement) =>
    set((state) => ({
      decorationPlacements: [
        ...state.decorationPlacements,
        {
          ...placement,
          id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        },
      ],
      isPlacingDecoration: false,
      selectedDecorationId: null,
    })),

  updateDecorationPlacement: (id, updates) =>
    set((state) => ({
      decorationPlacements: state.decorationPlacements.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  deleteDecorationPlacement: (id) =>
    set((state) => ({
      decorationPlacements: state.decorationPlacements.filter((d) => d.id !== id),
      selectedDecorationPlacementId:
        state.selectedDecorationPlacementId === id ? null : state.selectedDecorationPlacementId,
    })),

  setSelectedDecorationPlacementId: (id) =>
    set({ selectedDecorationPlacementId: id }),

  clearPageDecorations: (pageIndex) =>
    set((state) => ({
      decorationPlacements: state.decorationPlacements.filter((d) => d.pageIndex !== pageIndex),
    })),

  clearAllDecorations: () =>
    set({
      decorationPlacements: [],
      selectedDecorationPlacementId: null,
    }),

  setActiveFilter: (filter) =>
    set({ activeFilter: filter }),

  setFilterIntensity: (intensity) =>
    set({ filterIntensity: Math.max(0, Math.min(1, intensity)) }),

  addCustomFont: (font) =>
    set((state) => ({
      customFonts: [
        ...state.customFonts,
        {
          ...font,
          id: `custom_font_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          isBuiltIn: false,
          source: font.source || 'custom',
          createdAt: Date.now(),
        } as FontPreset,
      ],
    })),

  deleteCustomFont: (id) =>
    set((state) => ({
      customFonts: state.customFonts.filter((f) => f.id !== id),
      selectedFontId: state.selectedFontId === id ? 'ma-shan-zheng' : state.selectedFontId,
    })),

  updateCustomFont: (id, updates) =>
    set((state) => ({
      customFonts: state.customFonts.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),

  setFontSearchQuery: (query) =>
    set({ fontSearchQuery: query }),

  setFontCategoryFilter: (category) =>
    set({ fontCategoryFilter: category }),

  setFontSourceFilter: (source) =>
    set({ fontSourceFilter: source }),
}))
