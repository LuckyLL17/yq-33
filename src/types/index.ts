export type PaperType = 'blank' | 'line' | 'grid' | 'kraft' | 'dotted';

export interface FontPreset {
  id: string;
  name: string;
  family: string;
  previewText: string;
  category: 'cn' | 'en';
}

export interface PaperPreset {
  id: string;
  name: string;
  type: PaperType;
  bgColor: string;
  lineColor: string;
  lineSpacing: number;
  showMargin: boolean;
}

export interface HandwritingFont {
  family: string;
  size: number;
  color: string;
  weight: number;
  jitter: number;
}

export interface HandwritingPaper {
  type: PaperType;
  bgColor: string;
  lineColor: string;
  lineSpacing: number;
  showMargin: boolean;
  marginColor?: string;
}

export interface HandwritingLayout {
  pageWidth: number;
  pageHeight: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  letterSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
}

export interface HandwritingConfig {
  font: HandwritingFont;
  paper: HandwritingPaper;
  layout: HandwritingLayout;
}

export type FontConfig = HandwritingFont;
export type PaperConfig = HandwritingPaper;
export type LayoutConfig = HandwritingLayout;

export interface TextLine {
  text: string;
  width: number;
  y: number;
}

export interface PageLines {
  lines: TextLine[];
  pageIndex: number;
}

export interface Signature {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: number;
  bgOpacity: number;
  paperId: string;
  paperBgColor: string;
  paperLineColor: string;
  paperLineSpacing: number;
  paperType: string;
}

export interface SignaturePlacement {
  signatureId: string;
  pageIndex: number;
  x: number;
  y: number;
  scale: number;
}

export interface WorkspaceState {
  rawText: string;
  fileName: string;
  config: HandwritingConfig;
  currentPage: number;
  zoom: number;
  isProcessing: boolean;
  setText: (text: string) => void;
  updateConfig: (partial: Partial<HandwritingConfig> | { [key: string]: any }) => void;
  resetConfig: () => void;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setProcessing: (processing: boolean) => void;
}
