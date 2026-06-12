import type { FontConfig, LayoutConfig, TextLine, PageLines } from '../types';

export function removeBOM(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n|\r/g, '\n');
}

export function sanitizeText(text: string): string {
  return normalizeNewlines(removeBOM(text));
}

interface FontStyle {
  family: string;
  size: number;
  weight: number;
  letterSpacing?: number;
}

export interface LineSegment {
  text: string;
  isParagraphEnd: boolean;
}

let sharedCtx: CanvasRenderingContext2D | null = null;

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx) {
    const canvas = document.createElement('canvas');
    sharedCtx = canvas.getContext('2d');
  }
  return sharedCtx;
}

export function measureTextWidth(
  text: string,
  font: FontStyle,
  letterSpacing: number = 0
): number {
  const ctx = getCanvasCtx();
  if (!ctx) return text.length * font.size * 0.6;

  ctx.font = `${font.weight} ${font.size}px "${font.family}"`;
  const baseWidth = ctx.measureText(text).width;
  return baseWidth + text.length * letterSpacing;
}

export function splitIntoLines(
  text: string,
  maxWidth: number,
  font: FontStyle,
  canvasCtx: CanvasRenderingContext2D | null
): LineSegment[] {
  const cleanText = sanitizeText(text);
  const paragraphs = cleanText.split('\n');
  const lines: LineSegment[] = [];

  const letterSpacing = font.letterSpacing ?? 0;
  const ctx = canvasCtx ?? getCanvasCtx();

  if (ctx) {
    ctx.font = `${font.weight} ${font.size}px "${font.family}"`;
  }

  const measureChar = (char: string): number => {
    if (!ctx) return font.size * 0.6;
    return ctx.measureText(char).width + letterSpacing;
  };

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];
    if (paragraph.length === 0) {
      lines.push({ text: '', isParagraphEnd: true });
      continue;
    }

    let currentLine = '';
    let currentWidth = 0;

    for (let i = 0; i < paragraph.length; i++) {
      const char = paragraph[i];
      const charWidth = measureChar(char);

      if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
        lines.push({ text: currentLine, isParagraphEnd: false });
        currentLine = char;
        currentWidth = charWidth;
      } else {
        currentLine += char;
        currentWidth += charWidth;
      }
    }

    if (currentLine.length > 0) {
      lines.push({ text: currentLine, isParagraphEnd: true });
    }
  }

  return lines;
}

export function splitIntoPages(
  lines: LineSegment[],
  pageHeight: number,
  paddingTop: number,
  paddingBottom: number,
  lineHeightPx: number,
  paragraphSpacing: number
): LineSegment[][] {
  const pages: LineSegment[][] = [];
  const availableHeight = pageHeight - paddingTop - paddingBottom;

  let currentPage: LineSegment[] = [];
  let currentHeight = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineHeight = line.isParagraphEnd ? lineHeightPx + paragraphSpacing : lineHeightPx;

    if (currentHeight + lineHeight > availableHeight && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(line);
    currentHeight += lineHeight;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

export function splitTextIntoLines(
  text: string,
  font: FontConfig,
  layout: LayoutConfig
): TextLine[] {
  const { pageWidth, paddingLeft, paddingRight, paddingTop, lineHeight, letterSpacing, paragraphSpacing } = layout;
  const maxWidth = pageWidth - paddingLeft - paddingRight;
  const lineHeightPx = font.size * lineHeight;

  const segments = splitIntoLines(text, maxWidth, { ...font, letterSpacing }, getCanvasCtx());
  const textLines: TextLine[] = [];

  let currentY = paddingTop + font.size;

  for (const seg of segments) {
    const width = measureTextWidth(seg.text, font, letterSpacing);
    textLines.push({ text: seg.text, width, y: currentY });
    currentY += seg.isParagraphEnd ? lineHeightPx + paragraphSpacing : lineHeightPx;
  }

  return textLines;
}

export function paginateLines(
  lines: TextLine[],
  layout: LayoutConfig,
  font: FontConfig
): PageLines[] {
  const { pageHeight, paddingTop, paddingBottom, lineHeight, paragraphSpacing } = layout;
  const availableHeight = pageHeight - paddingTop - paddingBottom;
  const lineHeightPx = font.size * lineHeight;

  const pages: PageLines[] = [];
  let currentPageLines: TextLine[] = [];
  let currentHeight = 0;
  let baseY = paddingTop + font.size;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLast = i === lines.length - 1;
    const nextIsParagraphEnd = !isLast && lines[i + 1].y - line.y > lineHeightPx + 1;

    const adjustedLine = { ...line, y: baseY + currentHeight };
    currentPageLines.push(adjustedLine);

    const heightIncrement = nextIsParagraphEnd ? lineHeightPx + paragraphSpacing : lineHeightPx;
    currentHeight += heightIncrement;

    if (currentHeight > availableHeight - lineHeightPx && i < lines.length - 1) {
      pages.push({ lines: currentPageLines, pageIndex: pages.length });
      currentPageLines = [];
      currentHeight = 0;
    }
  }

  if (currentPageLines.length > 0) {
    pages.push({ lines: currentPageLines, pageIndex: pages.length });
  }

  if (pages.length === 0) {
    pages.push({ lines: [], pageIndex: 0 });
  }

  return pages;
}

export function getPageLines(
  text: string,
  font: FontConfig,
  layout: LayoutConfig,
  pageIndex: number
): TextLine[] {
  const lines = splitTextIntoLines(text, font, layout);
  const pages = paginateLines(lines, layout, font);
  const safeIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));
  return pages[safeIndex].lines;
}

export function getTotalPages(
  text: string,
  font: FontConfig,
  layout: LayoutConfig
): number {
  const lines = splitTextIntoLines(text, font, layout);
  const pages = paginateLines(lines, layout, font);
  return pages.length;
}
