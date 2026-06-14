import { describe, it, expect } from 'vitest';
import {
  removeBOM,
  normalizeNewlines,
  sanitizeText,
  splitIntoPages,
  paginateLines,
  type LineSegment,
} from '../textUtils';
import type { TextLine, LayoutConfig, FontConfig } from '@/types';

describe('textUtils - 纯函数单元测试', () => {
  describe('removeBOM', () => {
    it('应该移除字符串开头的 BOM 字符', () => {
      const bomText = '\ufeffHello World';
      expect(removeBOM(bomText)).toBe('Hello World');
    });

    it('不应该修改没有 BOM 的字符串', () => {
      const text = 'Hello World';
      expect(removeBOM(text)).toBe('Hello World');
    });

    it('不应该移除字符串中间的 BOM 字符', () => {
      const text = 'Hello\ufeffWorld';
      expect(removeBOM(text)).toBe('Hello\ufeffWorld');
    });

    it('应该正确处理空字符串', () => {
      expect(removeBOM('')).toBe('');
    });

    it('应该正确处理只有 BOM 的字符串', () => {
      expect(removeBOM('\ufeff')).toBe('');
    });
  });

  describe('normalizeNewlines', () => {
    it('应该将 \\r\\n 转换为 \\n', () => {
      expect(normalizeNewlines('line1\r\nline2')).toBe('line1\nline2');
    });

    it('应该将 \\r 转换为 \\n', () => {
      expect(normalizeNewlines('line1\rline2')).toBe('line1\nline2');
    });

    it('不应该修改只有 \\n 的字符串', () => {
      expect(normalizeNewlines('line1\nline2')).toBe('line1\nline2');
    });

    it('应该正确处理混合换行符', () => {
      expect(normalizeNewlines('line1\r\nline2\rline3\nline4')).toBe('line1\nline2\nline3\nline4');
    });

    it('应该正确处理空字符串', () => {
      expect(normalizeNewlines('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('应该同时移除 BOM 并标准化换行符', () => {
      const text = '\ufeffline1\r\nline2\rline3';
      expect(sanitizeText(text)).toBe('line1\nline2\nline3');
    });

    it('不应该修改已经干净的文本', () => {
      expect(sanitizeText('line1\nline2')).toBe('line1\nline2');
    });
  });

  describe('splitIntoPages', () => {
    const createLineSegments = (count: number, paragraphEndEvery: number = 3): LineSegment[] => {
      return Array.from({ length: count }, (_, i) => ({
        text: `Line ${i + 1}`,
        isParagraphEnd: (i + 1) % paragraphEndEvery === 0,
      }));
    };

    it('应该将行正确分页', () => {
      const lines = createLineSegments(10, 3);
      const result = splitIntoPages(lines, 100, 10, 10, 20, 5);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(page => Array.isArray(page))).toBe(true);
    });

    it('当可用高度足够时应该只有一页', () => {
      const lines = createLineSegments(3, 3);
      const result = splitIntoPages(lines, 1000, 10, 10, 20, 5);
      expect(result.length).toBe(1);
      expect(result[0].length).toBe(3);
    });

    it('当内容超出一页时应该分成多页', () => {
      const lines = createLineSegments(20, 4);
      const result = splitIntoPages(lines, 100, 10, 10, 20, 5);
      expect(result.length).toBeGreaterThan(1);
    });

    it('段落结束行应该包含额外的段落间距', () => {
      const lines: LineSegment[] = [
        { text: 'Line 1', isParagraphEnd: true },
        { text: 'Line 2', isParagraphEnd: false },
      ];
      const result = splitIntoPages(lines, 1000, 10, 10, 20, 5);
      expect(result.length).toBe(1);
      expect(result[0].length).toBe(2);
    });

    it('当没有行时应该返回包含空数组的单页', () => {
      const result = splitIntoPages([], 100, 10, 10, 20, 5);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual([]);
    });

    it('应该考虑边距计算可用高度', () => {
      const lines = createLineSegments(10, 5);
      const smallPaddingResult = splitIntoPages(lines, 100, 5, 5, 20, 5);
      const largePaddingResult = splitIntoPages(lines, 100, 50, 50, 20, 5);
      expect(largePaddingResult.length).toBeGreaterThanOrEqual(smallPaddingResult.length);
    });
  });

  describe('paginateLines', () => {
    const createTextLines = (count: number): TextLine[] => {
      return Array.from({ length: count }, (_, i) => ({
        text: `Line ${i + 1}`,
        width: 100,
        y: 50 + i * 30,
      }));
    };

    const mockLayout: LayoutConfig = {
      pageWidth: 500,
      pageHeight: 500,
      paddingTop: 30,
      paddingRight: 30,
      paddingBottom: 30,
      paddingLeft: 30,
      letterSpacing: 0,
      lineHeight: 1.5,
      paragraphSpacing: 10,
    };

    const mockFont: FontConfig = {
      family: 'Test',
      size: 20,
      color: '#000000',
      weight: 400,
      jitter: 0,
      jitterSettings: {
        positionX: 0, positionY: 0, size: 0, rotation: 0, baseline: 0,
        inkDensity: 0, inkColor: 0, spacing: 0, lineDrift: 0, lineTilt: 0,
        halo: 0, dryBrush: 0,
      },
    };

    it('应该将 TextLine 正确分页', () => {
      const lines = createTextLines(5);
      const result = paginateLines(lines, mockLayout, mockFont);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].pageIndex).toBe(0);
    });

    it('每页应该有正确的 pageIndex', () => {
      const lines = createTextLines(30);
      const result = paginateLines(lines, { ...mockLayout, pageHeight: 200 }, mockFont);
      result.forEach((page, index) => {
        expect(page.pageIndex).toBe(index);
      });
    });

    it('当没有行时应该返回包含空数组的单页', () => {
      const result = paginateLines([], mockLayout, mockFont);
      expect(result.length).toBe(1);
      expect(result[0].lines).toEqual([]);
      expect(result[0].pageIndex).toBe(0);
    });

    it('应该正确调整每页的 y 坐标', () => {
      const lines = createTextLines(20);
      const result = paginateLines(lines, { ...mockLayout, pageHeight: 150 }, mockFont);
      if (result.length > 1) {
        const firstLineFirstPage = result[0].lines[0];
        const firstLineSecondPage = result[1].lines[0];
        expect(firstLineFirstPage.y).toBeGreaterThanOrEqual(mockLayout.paddingTop + mockFont.size);
        expect(firstLineSecondPage.y).toBeGreaterThanOrEqual(mockLayout.paddingTop + mockFont.size);
      }
    });

    it('应该考虑段落间距', () => {
      const lines: TextLine[] = [
        { text: 'Line 1', width: 100, y: 50 },
        { text: 'Line 2', width: 100, y: 100 },
        { text: 'Line 3', width: 100, y: 150 },
        { text: 'Line 4', width: 100, y: 200 },
      ];
      const result = paginateLines(lines, { ...mockLayout, pageHeight: 180 }, mockFont);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
