import { describe, it, expect } from 'vitest';
import { paginateMarkdownLines } from '../../markdown/markdownRenderer';
import type { RenderLine } from '../../markdown/markdownRenderer';
import { defaultMarkdownStyles } from '../../markdown/styles';

describe('markdown/markdownRenderer - 纯函数单元测试', () => {
  describe('paginateMarkdownLines', () => {
    const createMockRenderLine = (y: number, height: number, fontSize: number = 24): RenderLine => ({
      segments: [],
      y,
      height,
      blockType: 'paragraph',
      blockStyle: {
        ...defaultMarkdownStyles.paragraph,
        fontSize,
      },
      isFirstLineOfBlock: false,
      isLastLineOfBlock: false,
      blockIndent: 0,
    });

    it('应该正确将行分页', () => {
      const lines: RenderLine[] = [
        createMockRenderLine(50, 30),
        createMockRenderLine(80, 30),
        createMockRenderLine(110, 30),
        createMockRenderLine(140, 30),
      ];

      const result = paginateMarkdownLines(lines, 200, 20, 20);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(page => Array.isArray(page))).toBe(true);
    });

    it('当内容适合一页时应该返回单页', () => {
      const lines: RenderLine[] = [
        createMockRenderLine(50, 30),
        createMockRenderLine(80, 30),
      ];

      const result = paginateMarkdownLines(lines, 500, 20, 20);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(2);
    });

    it('当内容超出一页时应该分成多页', () => {
      const lines: RenderLine[] = Array.from({ length: 20 }, (_, i) =>
        createMockRenderLine(50 + i * 30, 30)
      );

      const result = paginateMarkdownLines(lines, 200, 20, 20);

      expect(result.length).toBeGreaterThan(1);
    });

    it('当没有行时应该返回包含空数组的单页', () => {
      const result = paginateMarkdownLines([], 500, 20, 20);

      expect(result.length).toBe(1);
      expect(result[0]).toEqual([]);
    });

    it('应该正确调整每页的 y 坐标偏移', () => {
      const lines: RenderLine[] = Array.from({ length: 10 }, (_, i) =>
        createMockRenderLine(50 + i * 30, 30)
      );

      const result = paginateMarkdownLines(lines, 200, 20, 20);

      if (result.length > 1) {
        const firstLineFirstPage = result[0][0];
        const firstLineSecondPage = result[1][0];

        expect(firstLineFirstPage.y).toBeGreaterThanOrEqual(20);
        expect(firstLineSecondPage.y).toBeGreaterThanOrEqual(20);
      }
    });

    it('应该考虑 marginTop 和 marginBottom 计算可用高度', () => {
      const lines: RenderLine[] = Array.from({ length: 10 }, (_, i) =>
        createMockRenderLine(50 + i * 30, 30)
      );

      const smallMarginsResult = paginateMarkdownLines(lines, 500, 10, 10);
      const largeMarginsResult = paginateMarkdownLines(lines, 500, 100, 100);

      expect(largeMarginsResult.length).toBeGreaterThanOrEqual(smallMarginsResult.length);
    });

    it('第一行的 y 偏移应该包含 marginTop 和 fontSize', () => {
      const lines: RenderLine[] = [
        createMockRenderLine(50, 30, 24),
      ];

      const marginTop = 30;
      const result = paginateMarkdownLines(lines, 500, marginTop, 20);

      expect(result.length).toBe(1);
      expect(result[0][0].y).toBeGreaterThanOrEqual(marginTop);
    });

    it('每页应该包含连续的行', () => {
      const lines: RenderLine[] = Array.from({ length: 15 }, (_, i) =>
        createMockRenderLine(50 + i * 25, 25)
      );

      const result = paginateMarkdownLines(lines, 300, 20, 20);
      const totalLines = result.reduce((sum, page) => sum + page.length, 0);

      expect(totalLines).toBe(lines.length);
    });

    it('应该正确处理高度不同的行', () => {
      const lines: RenderLine[] = [
        createMockRenderLine(50, 40),
        createMockRenderLine(90, 30),
        createMockRenderLine(120, 50),
        createMockRenderLine(170, 30),
        createMockRenderLine(200, 40),
      ];

      const result = paginateMarkdownLines(lines, 300, 20, 20);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(page => page.length > 0 || result.length === 1)).toBe(true);
    });

    it('应该正确处理非常大的页面高度（所有内容在一页）', () => {
      const lines: RenderLine[] = Array.from({ length: 50 }, (_, i) =>
        createMockRenderLine(50 + i * 20, 20)
      );

      const result = paginateMarkdownLines(lines, 10000, 20, 20);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(50);
    });

    it('应该正确处理非常小的页面高度', () => {
      const lines: RenderLine[] = [
        createMockRenderLine(50, 30),
        createMockRenderLine(80, 30),
        createMockRenderLine(110, 30),
        createMockRenderLine(140, 30),
        createMockRenderLine(170, 30),
      ];

      const result = paginateMarkdownLines(lines, 100, 10, 10);

      expect(result.length).toBeGreaterThan(1);
      expect(result.every(page => page.length > 0)).toBe(true);
    });

    it('当刚好填满一页时不应该创建空的最后一页', () => {
      const lines: RenderLine[] = Array.from({ length: 5 }, (_, i) =>
        createMockRenderLine(50 + i * 30, 30)
      );

      const pageHeight = 50 + 5 * 30 + 40;
      const result = paginateMarkdownLines(lines, pageHeight, 20, 20);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(5);
    });
  });
});
