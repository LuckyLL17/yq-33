import type { MarkdownBlock, MarkdownTextSegment, MarkdownStyle, MarkdownElementType } from './types';
import { parseMarkdown } from './parser';
import { defaultMarkdownStyles } from './styles';
import { seededRandom } from '../canvasUtils';

interface RenderLine {
  segments: RenderSegment[];
  y: number;
  height: number;
  blockType: MarkdownElementType;
  blockStyle: MarkdownStyle;
  isFirstLineOfBlock: boolean;
  isLastLineOfBlock: boolean;
  blockIndent: number;
  blockBackground?: {
    color: string;
    padding: number;
    borderRadius: number;
  };
  blockBorderLeft?: {
    width: number;
    color: string;
    offset: number;
  };
  listMarker?: string;
  listMarkerWidth?: number;
}

interface RenderSegment {
  text: string;
  type: MarkdownTextSegment['type'];
  style: MarkdownStyle;
  width: number;
  xOffset: number;
  isStrikethrough?: boolean;
}

interface MarkdownRenderOptions {
  maxWidth: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  defaultFontFamily: string;
  baseFontSize: number;
  baseInkColor: string;
  jitterAmount: number;
  letterSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  styles?: Partial<Record<MarkdownElementType, Partial<MarkdownStyle>>>;
}

function measureText(
  text: string,
  fontSize: number,
  fontWeight: number,
  fontFamily: string,
  ctx: CanvasRenderingContext2D | null
): number {
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

function getMergedStyle(
  elementType: MarkdownElementType,
  baseStyles: Record<MarkdownElementType, MarkdownStyle>,
  overrides?: Partial<Record<MarkdownElementType, Partial<MarkdownStyle>>>
): MarkdownStyle {
  const base = baseStyles[elementType] || baseStyles.paragraph;
  const override = overrides?.[elementType] || {};
  return { ...base, ...override };
}

function getInlineStyle(
  segmentType: MarkdownTextSegment['type'],
  parentStyle: MarkdownStyle,
  baseStyles: Record<MarkdownElementType, MarkdownStyle>
): MarkdownStyle {
  if (segmentType === 'text') {
    return parentStyle;
  }
  
  const inlineBase = baseStyles[segmentType as MarkdownElementType];
  if (!inlineBase) {
    return parentStyle;
  }
  
  return {
    ...parentStyle,
    fontSize: inlineBase.fontSize || parentStyle.fontSize,
    fontWeight: inlineBase.fontWeight || parentStyle.fontWeight,
    inkColor: inlineBase.inkColor || parentStyle.inkColor,
    letterSpacing: inlineBase.letterSpacing ?? parentStyle.letterSpacing,
    jitterAmount: inlineBase.jitterAmount ?? parentStyle.jitterAmount,
  };
}

function breakTextIntoLines(
  segments: MarkdownTextSegment[],
  maxWidth: number,
  blockStyle: MarkdownStyle,
  baseStyles: Record<MarkdownElementType, MarkdownStyle>,
  defaultFontFamily: string,
  ctx: CanvasRenderingContext2D | null
): { text: string; style: MarkdownStyle; type: MarkdownTextSegment['type'] }[][] {
  const lines: { text: string; style: MarkdownStyle; type: MarkdownTextSegment['type'] }[][] = [];
  let currentLine: { text: string; style: MarkdownStyle; type: MarkdownTextSegment['type'] }[] = [];
  let currentWidth = 0;

  for (const segment of segments) {
    const style = getInlineStyle(segment.type, blockStyle, baseStyles);
    const fontFamily = style.fontFamily || defaultFontFamily;
    const chars = segment.text.split('');
    
    for (const char of chars) {
      const charWidth = measureText(char, style.fontSize, style.fontWeight, fontFamily, ctx) + style.letterSpacing;
      
      if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [{ text: char, style, type: segment.type }];
        currentWidth = charWidth;
      } else {
        const lastSeg = currentLine[currentLine.length - 1];
        if (lastSeg && lastSeg.type === segment.type) {
          lastSeg.text += char;
        } else {
          currentLine.push({ text: char, style, type: segment.type });
        }
        currentWidth += charWidth;
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    lines.push([]);
  }

  return lines;
}

export function layoutMarkdown(
  text: string,
  options: MarkdownRenderOptions,
  ctx: CanvasRenderingContext2D | null
): { lines: RenderLine[]; totalHeight: number } {
  const {
    maxWidth,
    marginTop,
    marginLeft,
    defaultFontFamily,
    baseStyles: styleOverrides,
  } = options;

  const blocks = parseMarkdown(text);
  const renderLines: RenderLine[] = [];
  let currentY = marginTop;

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex];
    const blockStyle = getMergedStyle(block.type, defaultMarkdownStyles, styleOverrides);
    const lineHeightPx = blockStyle.fontSize * blockStyle.lineHeight;
    
    const listStyle = blockStyle.listStyle;
    const blockIndent = listStyle?.indent || blockStyle.paddingLeft || 0;
    const contentWidth = maxWidth - blockIndent - 20;

    let textLines: { text: string; style: MarkdownStyle; type: MarkdownTextSegment['type'] }[][];
    
    if (block.type === 'unorderedList' || block.type === 'orderedList') {
      textLines = [];
      if (block.listItems) {
        for (let li = 0; li < block.listItems.length; li++) {
          const item = block.listItems[li];
          const itemStyle = getMergedStyle('listItem', defaultMarkdownStyles, styleOverrides);
          const marker = block.type === 'orderedList' ? `${li + 1}.` : '•';
          const itemLines = breakTextIntoLines(
            item.segments,
            contentWidth - (listStyle?.indent || 28),
            itemStyle,
            defaultMarkdownStyles,
            defaultFontFamily,
            ctx
          );
          
          for (let li2 = 0; li2 < itemLines.length; li2++) {
            const line = itemLines[li2];
            if (li2 === 0) {
              textLines.push([
                { text: marker + ' ', style: itemStyle, type: 'text' as const },
                ...line,
              ]);
            } else {
              textLines.push(line.map(s => ({ ...s })));
            }
          }
        }
      }
    } else {
      textLines = breakTextIntoLines(
        block.segments,
        contentWidth,
        blockStyle,
        defaultMarkdownStyles,
        defaultFontFamily,
        ctx
      );
    }

    if (textLines.length === 0) {
      textLines = [[]];
    }

    currentY += blockStyle.marginTop;

    for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
      const textLine = textLines[lineIndex];
      const isFirst = lineIndex === 0;
      const isLast = lineIndex === textLines.length - 1;

      let lineWidth = 0;
      const renderSegments: RenderSegment[] = [];
      let xOffset = 0;

      for (const seg of textLine) {
        const segWidth = measureText(seg.text, seg.style.fontSize, seg.style.fontWeight, seg.style.fontFamily || defaultFontFamily, ctx) + seg.style.letterSpacing * seg.text.length;
        renderSegments.push({
          text: seg.text,
          type: seg.type,
          style: seg.style,
          width: segWidth,
          xOffset: lineWidth,
          isStrikethrough: seg.type === 'strikethrough',
        });
        lineWidth += segWidth;
      }

      renderLines.push({
        segments: renderSegments,
        y: currentY + blockStyle.fontSize,
        height: lineHeightPx,
        blockType: block.type,
        blockStyle,
        isFirstLineOfBlock: isFirst,
        isLastLineOfBlock: isLast,
        blockIndent: blockIndent,
        blockBackground: blockStyle.background,
        blockBorderLeft: blockStyle.borderLeft,
      });

      currentY += lineHeightPx;
    }

    currentY += blockStyle.marginBottom;
  }

  return {
    lines: renderLines,
    totalHeight: currentY + options.marginBottom,
  };
}

export function paginateMarkdownLines(
  lines: RenderLine[],
  pageHeight: number,
  marginTop: number,
  marginBottom: number
): RenderLine[][] {
  const pages: RenderLine[][] = [];
  let currentPage: RenderLine[] = [];
  let currentHeight = 0;
  const availableHeight = pageHeight - marginTop - marginBottom;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (currentHeight + line.height > availableHeight && currentPage.length > 0) {
      const pageOffset = marginTop - currentPage[0].y + currentPage[0].blockStyle.fontSize;
      const adjustedPage = currentPage.map(l => ({
        ...l,
        y: l.y + pageOffset,
      }));
      pages.push(adjustedPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(line);
    currentHeight += line.height;
  }

  if (currentPage.length > 0) {
    const pageOffset = marginTop - currentPage[0].y + currentPage[0].blockStyle.fontSize;
    const adjustedPage = currentPage.map(l => ({
      ...l,
      y: l.y + pageOffset,
    }));
    pages.push(adjustedPage);
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

export function drawMarkdownPage(
  ctx: CanvasRenderingContext2D,
  pageLines: RenderLine[],
  pageIndex: number,
  options: MarkdownRenderOptions,
  baseSeed: number = 17
) {
  const {
    marginLeft,
    defaultFontFamily,
    jitterAmount: globalJitter,
  } = options;

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  const pageSeed = pageIndex * 100001 + baseSeed;

  let blockStartLine = -1;
  let blockEndLine = -1;
  let currentBlockType: MarkdownElementType | null = null;

  const drawBlockBackground = (startIdx: number, endIdx: number) => {
    if (startIdx < 0 || endIdx < 0) return;
    const line = pageLines[startIdx];
    if (!line.blockBackground) return;

    const bg = line.blockBackground;
    const firstLine = pageLines[startIdx];
    const lastLine = pageLines[endIdx];
    
    const x = marginLeft + line.blockIndent - bg.padding;
    const y = firstLine.y - firstLine.blockStyle.fontSize - bg.padding / 2;
    const width = options.maxWidth - line.blockIndent - 20 + bg.padding * 2;
    const height = lastLine.y - firstLine.y + lastLine.height + bg.padding;

    ctx.save();
    ctx.fillStyle = bg.color;
    ctx.beginPath();
    const r = bg.borderRadius;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawBlockBorderLeft = (startIdx: number, endIdx: number) => {
    if (startIdx < 0 || endIdx < 0) return;
    const line = pageLines[startIdx];
    if (!line.blockBorderLeft) return;

    const border = line.blockBorderLeft;
    const firstLine = pageLines[startIdx];
    const lastLine = pageLines[endIdx];
    
    const x = marginLeft + line.blockIndent - border.offset;
    const y = firstLine.y - firstLine.blockStyle.fontSize - 4;
    const height = lastLine.y - firstLine.y + lastLine.height + 8;

    ctx.save();
    ctx.fillStyle = border.color;
    ctx.fillRect(x, y, border.width, height);
    ctx.restore();
  };

  for (let li = 0; li < pageLines.length; li++) {
    const line = pageLines[li];
    
    if (line.blockType !== currentBlockType || line.isFirstLineOfBlock) {
      if (blockStartLine >= 0 && blockEndLine >= 0) {
        drawBlockBackground(blockStartLine, blockEndLine);
        drawBlockBorderLeft(blockStartLine, blockEndLine);
      }
      blockStartLine = li;
      blockEndLine = li;
      currentBlockType = line.blockType;
    } else {
      blockEndLine = li;
    }
  }

  if (blockStartLine >= 0 && blockEndLine >= 0) {
    drawBlockBackground(blockStartLine, blockEndLine);
    drawBlockBorderLeft(blockStartLine, blockEndLine);
  }

  for (let li = 0; li < pageLines.length; li++) {
    const line = pageLines[li];
    const lineRand = seededRandom(pageSeed + li * 9973);
    
    const jAmount = Math.max(0.01, (line.blockStyle.jitterAmount ?? globalJitter));
    const lineDriftY = (lineRand() - 0.5) * 2.0 * jAmount * line.blockStyle.fontSize * 0.1;
    const lineTilt = (lineRand() - 0.5) * 0.006 * jAmount;

    let x = marginLeft + line.blockIndent + 8;

    for (let si = 0; si < line.segments.length; si++) {
      const seg = line.segments[si];
      const segRand = seededRandom(pageSeed + li * 9973 + si * 137);
      
      const r1 = segRand();
      const r2 = segRand();
      const r3 = segRand();
      const r4 = segRand();
      const r5 = segRand();
      const r6 = segRand();
      const r7 = segRand();
      
      const fontFamily = seg.style.fontFamily || defaultFontFamily;
      const sizeVar = seg.style.fontSize * (1 + (r1 - 0.5) * 0.1 * jAmount);
      
      const charRand = seededRandom(pageSeed + li * 9973 + si * 137 + 500);
      let currentX = x;
      
      for (let ci = 0; ci < seg.text.length; ci++) {
        const ch = seg.text[ci];
        const cr1 = charRand();
        const cr2 = charRand();
        const cr3 = charRand();
        const cr4 = charRand();
        const cr5 = charRand();
        const cr6 = charRand();

        const charSize = sizeVar * (1 + (cr1 - 0.5) * 0.06 * jAmount);
        
        ctx.font = `${seg.style.fontWeight} ${charSize.toFixed(1)}px ${fontFamily}`;
        const cw = ctx.measureText(ch).width;
        
        const dx = (cr2 - 0.5) * 1.5 * jAmount * charSize * 0.15;
        const dy = lineDriftY + (cr3 - 0.5) * 1.2 * jAmount * charSize * 0.12;
        const rot = lineTilt + (cr4 - 0.5) * 0.04 * jAmount;

        const baseAlpha = 0.82;
        const alphaRange = 0.18;
        const alpha = baseAlpha + cr5 * alphaRange * jAmount;

        const ink = hexToRgb(seg.style.inkColor);
        const inkVar = 1 + (cr6 - 0.5) * 0.12 * jAmount;
        const inkR = Math.min(255, Math.max(0, Math.floor(ink.r * inkVar)));
        const inkG = Math.min(255, Math.max(0, Math.floor(ink.g * inkVar)));
        const inkB = Math.min(255, Math.max(0, Math.floor(ink.b * inkVar)));

        const cx = currentX + dx + cw / 2;
        const cy = line.y + dy;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = `rgba(${inkR},${inkG},${inkB},${alpha})`;
        ctx.font = `${seg.style.fontWeight} ${charSize.toFixed(1)}px ${fontFamily}`;
        ctx.fillText(ch, -cw / 2, 0);

        if (seg.isStrikethrough) {
          ctx.strokeStyle = `rgba(${inkR},${inkG},${inkB},${alpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-cw / 2, -charSize * 0.15);
          ctx.lineTo(cw / 2, -charSize * 0.15);
          ctx.stroke();
        }

        ctx.restore();

        currentX += cw + seg.style.letterSpacing;
      }

      x += seg.width + seg.style.letterSpacing * seg.text.length;
    }
  }

  ctx.restore();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
