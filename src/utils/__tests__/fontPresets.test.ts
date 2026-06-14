import { describe, it, expect } from 'vitest';
import {
  buildFontStack,
  getFontById,
  getAllFonts,
  filterFonts,
  builtInFonts,
} from '../fontPresets';
import type { FontPreset } from '@/types';

const createMockFont = (id: string, category: 'cn' | 'en' = 'cn', source: 'google' | 'custom' = 'google'): FontPreset => ({
  id,
  name: `Font ${id}`,
  family: `Font${id}`,
  previewText: 'Preview',
  category,
  source,
  isBuiltIn: source === 'google',
  fallbackFonts: 'serif',
});

describe('fontPresets - 纯函数单元测试', () => {
  describe('buildFontStack', () => {
    it('应该正确构建带 fallback 的字体栈', () => {
      const font: FontPreset = {
        id: 'test',
        name: 'Test',
        family: 'Test Font',
        previewText: 'Test',
        category: 'cn',
        source: 'google',
        isBuiltIn: true,
        fallbackFonts: '"楷体", "KaiTi", serif',
      };
      expect(buildFontStack(font)).toBe('"Test Font", "楷体", "KaiTi", serif');
    });

    it('应该正确构建没有 fallback 的字体栈', () => {
      const font: FontPreset = {
        id: 'test',
        name: 'Test',
        family: 'Test Font',
        previewText: 'Test',
        category: 'cn',
        source: 'google',
        isBuiltIn: true,
      };
      expect(buildFontStack(font)).toBe('"Test Font"');
    });

    it('应该正确处理包含空格的字体名称', () => {
      const font: FontPreset = {
        id: 'test',
        name: 'Test',
        family: 'Ma Shan Zheng',
        previewText: 'Test',
        category: 'cn',
        source: 'google',
        isBuiltIn: true,
        fallbackFonts: 'cursive',
      };
      expect(buildFontStack(font)).toBe('"Ma Shan Zheng", cursive');
    });

    it('应该正确处理自定义字体', () => {
      const font: FontPreset = {
        id: 'custom',
        name: 'Custom',
        family: 'Custom Font',
        previewText: 'Test',
        category: 'cn',
        source: 'custom',
        isBuiltIn: false,
        fontUrl: 'test.ttf',
      };
      expect(buildFontStack(font)).toBe('"Custom Font"');
    });
  });

  describe('getFontById', () => {
    it('应该通过 ID 找到内置字体', () => {
      const font = getFontById('ma-shan-zheng');
      expect(font).toBeDefined();
      expect(font?.id).toBe('ma-shan-zheng');
      expect(font?.family).toBe('Ma Shan Zheng');
    });

    it('应该通过 ID 找到自定义字体', () => {
      const customFonts: FontPreset[] = [
        {
          id: 'custom-1',
          name: 'Custom 1',
          family: 'Custom1',
          previewText: 'Test',
          category: 'cn',
          source: 'custom',
          isBuiltIn: false,
          fontUrl: 'test.ttf',
        },
      ];
      const font = getFontById('custom-1', customFonts);
      expect(font).toBeDefined();
      expect(font?.id).toBe('custom-1');
    });

    it('应该优先从内置字体中查找', () => {
      const customFonts: FontPreset[] = [
        {
          id: 'ma-shan-zheng',
          name: 'Override',
          family: 'Override',
          previewText: 'Test',
          category: 'cn',
          source: 'custom',
          isBuiltIn: false,
          fontUrl: 'test.ttf',
        },
      ];
      const font = getFontById('ma-shan-zheng', customFonts);
      expect(font).toBeDefined();
      expect(font?.isBuiltIn).toBe(true);
      expect(font?.family).toBe('Ma Shan Zheng');
    });

    it('找不到字体时应该返回 undefined', () => {
      expect(getFontById('non-existent-id')).toBeUndefined();
      expect(getFontById('non-existent-id', [])).toBeUndefined();
      expect(getFontById('non-existent-id', [createMockFont('custom-1')])).toBeUndefined();
    });

    it('customFonts 参数为空数组时应该只查找内置字体', () => {
      const font = getFontById('zhi-mang-xing', []);
      expect(font).toBeDefined();
      expect(font?.id).toBe('zhi-mang-xing');
    });
  });

  describe('getAllFonts', () => {
    it('应该返回所有内置字体', () => {
      const fonts = getAllFonts();
      expect(fonts.length).toBe(builtInFonts.length);
      expect(fonts.every(f => builtInFonts.some(bf => bf.id === f.id))).toBe(true);
    });

    it('应该包含自定义字体附加到内置字体之后', () => {
      const customFonts: FontPreset[] = [
        createMockFont('custom-1'),
        createMockFont('custom-2'),
      ];
      const allFonts = getAllFonts(customFonts);
      expect(allFonts.length).toBe(builtInFonts.length + 2);
      expect(allFonts[allFonts.length - 1].id).toBe('custom-2');
      expect(allFonts[allFonts.length - 2].id).toBe('custom-1');
    });

    it('应该返回新的数组是独立于原始数组', () => {
      const customFonts: FontPreset[] = [createMockFont('custom-1')];
      const allFonts = getAllFonts(customFonts);
      allFonts.push(createMockFont('temp'));
      expect(getAllFonts(customFonts).length).toBe(builtInFonts.length + 1);
    });

    it('空数组时应该返回内置字体副本', () => {
      const allFonts = getAllFonts([]);
      expect(allFonts.length).toBe(builtInFonts.length);
      allFonts.push(createMockFont('temp'));
      expect(getAllFonts([]).length).toBe(builtInFonts.length);
    });
  });

  describe('filterFonts', () => {
    const testFonts: FontPreset[] = [
      { ...createMockFont('cn-1', 'cn', 'google'),
      name: '中文字体1',
      previewText: '中文预览',
      category: 'cn',
      source: 'google',
    },
    {
      ...createMockFont('cn-2', 'cn', 'custom'),
      name: '中文字体2',
      previewText: '另一个预览',
      category: 'cn',
      source: 'custom',
    },
    {
      ...createMockFont('en-1', 'en', 'google'),
      name: 'English Font 1',
      previewText: 'English Preview',
      category: 'en',
      source: 'google',
    },
    {
      ...createMockFont('en-2', 'en', 'custom'),
      name: 'English Font 2',
      previewText: 'Another Preview',
      category: 'en',
      source: 'custom',
    },
    {
      ...createMockFont('mixed', 'cn', 'google'),
      name: 'English and 中文混合',
      previewText: 'English and 中文 preview',
      category: 'cn',
      source: 'google',
    },
  ];

    it('应该按 category 过滤字体', () => {
      const cnFonts = filterFonts(testFonts, { category: 'cn' });
      expect(cnFonts.length).toBe(3);
      expect(cnFonts.every(f => f.category === 'cn')).toBe(true);

      const enFonts = filterFonts(testFonts, { category: 'en' });
      expect(enFonts.length).toBe(2);
      expect(enFonts.every(f => f.category === 'en')).toBe(true);
    });

    it('应该按 source 过滤字体', () => {
      const googleFonts = filterFonts(testFonts, { source: 'google' });
      expect(googleFonts.length).toBe(3);
      expect(googleFonts.every(f => f.source === 'google')).toBe(true);

      const customFonts = filterFonts(testFonts, { source: 'custom' });
      expect(customFonts.length).toBe(2);
      expect(customFonts.every(f => f.source === 'custom')).toBe(true);
    });

    it('应该按搜索词过滤字体', () => {
      const chineseFonts = filterFonts(testFonts, { search: '中文' });
      expect(chineseFonts.length).toBeGreaterThanOrEqual(2);

      const englishFonts = filterFonts(testFonts, { search: 'English' });
      expect(englishFonts.length).toBeGreaterThanOrEqual(2);

      const previewFonts = filterFonts(testFonts, { search: '预览' });
      expect(previewFonts.length).toBeGreaterThanOrEqual(2);
    });

    it('搜索应该不区分大小写', () => {
      const result1 = filterFonts(testFonts, { search: 'ENGLISH' });
      const result2 = filterFonts(testFonts, { search: 'english' });
      expect(result1.length).toBe(result2.length);
    });

    it('应该同时应用多个过滤条件', () => {
      const result = filterFonts(testFonts, { category: 'cn', source: 'google' });
      expect(result.length).toBe(2);
      expect(result.every(f => f.category === 'cn' && f.source === 'google')).toBe(true);
    });

    it('搜索应该匹配 name、family 和 previewText', () => {
      const nameMatch = filterFonts(testFonts, { search: '中文字体1' });
      expect(nameMatch.length).toBe(1);
      expect(nameMatch[0].name).toBe('中文字体1');

      const previewMatch = filterFonts(testFonts, { search: '另一个预览' });
      expect(previewMatch.length).toBe(1);
      expect(previewMatch[0].previewText).toBe('另一个预览');
    });

    it('空过滤条件应该返回所有字体', () => {
      const result = filterFonts(testFonts, {});
      expect(result.length).toBe(testFonts.length);
    });

    it('搜索结果为空时应该返回空数组', () => {
      const result = filterFonts(testFonts, { search: 'nonexistent-keyword-xyz' });
      expect(result.length).toBe(0);
    });

    it('应该正确处理 category 和 search 组合条件', () => {
      const result = filterFonts(testFonts, { category: 'en', search: 'Font' });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every(f => f.category === 'en')).toBe(true);
    });

    it('应该正确处理 source 和 search 组合条件', () => {
      const result = filterFonts(testFonts, { source: 'custom', search: 'Font' });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(f => f.source === 'custom')).toBe(true);
    });
  });
});
