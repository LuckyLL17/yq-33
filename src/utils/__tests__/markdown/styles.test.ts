import { describe, it, expect } from 'vitest';
import {
  defaultMarkdownStyles,
  defaultMarkdownConfig,
  mergeMarkdownStyle,
} from '../../markdown/styles';
import type { MarkdownStyle, MarkdownElementType } from '../../markdown/types';

describe('markdown/styles - 纯函数单元测试', () => {
  describe('defaultMarkdownStyles', () => {
    it('应该包含所有 Markdown 元素类型的样式', () => {
      const elementTypes: MarkdownElementType[] = [
        'heading1', 'heading2', 'heading3', 'paragraph', 'blockquote',
        'unorderedList', 'orderedList', 'listItem',
        'bold', 'italic', 'boldItalic', 'strikethrough', 'code', 'link', 'text'
      ];

      elementTypes.forEach(type => {
        expect(defaultMarkdownStyles[type]).toBeDefined();
        expect(defaultMarkdownStyles[type].fontSize).toBeGreaterThan(0);
        expect(defaultMarkdownStyles[type].fontWeight).toBeDefined();
        expect(defaultMarkdownStyles[type].inkColor).toBeDefined();
        expect(defaultMarkdownStyles[type].lineHeight).toBeGreaterThan(0);
      });
    });

    it('标题应该比正文有更大的字体', () => {
      expect(defaultMarkdownStyles.heading1.fontSize).toBeGreaterThan(defaultMarkdownStyles.paragraph.fontSize);
      expect(defaultMarkdownStyles.heading2.fontSize).toBeGreaterThan(defaultMarkdownStyles.paragraph.fontSize);
      expect(defaultMarkdownStyles.heading3.fontSize).toBeGreaterThan(defaultMarkdownStyles.paragraph.fontSize);
    });

    it('标题应该按层级递减字号', () => {
      expect(defaultMarkdownStyles.heading1.fontSize).toBeGreaterThan(defaultMarkdownStyles.heading2.fontSize);
      expect(defaultMarkdownStyles.heading2.fontSize).toBeGreaterThan(defaultMarkdownStyles.heading3.fontSize);
    });

    it('粗体应该比正常文本有更高的字重', () => {
      expect(defaultMarkdownStyles.bold.fontWeight).toBeGreaterThan(defaultMarkdownStyles.text.fontWeight);
      expect(defaultMarkdownStyles.boldItalic.fontWeight).toBeGreaterThan(defaultMarkdownStyles.text.fontWeight);
    });

    it('代码应该有不同的墨水颜色', () => {
      expect(defaultMarkdownStyles.code.inkColor).not.toBe(defaultMarkdownStyles.text.inkColor);
    });

    it('链接应该有不同的墨水颜色', () => {
      expect(defaultMarkdownStyles.link.inkColor).not.toBe(defaultMarkdownStyles.text.inkColor);
    });

    it('删除线应该有较浅的墨水颜色', () => {
      expect(defaultMarkdownStyles.strikethrough.inkColor).not.toBe(defaultMarkdownStyles.text.inkColor);
    });

    it('块引用应该有边框左侧配置', () => {
      expect(defaultMarkdownStyles.blockquote.borderLeft).toBeDefined();
      expect(defaultMarkdownStyles.blockquote.borderLeft?.width).toBeGreaterThan(0);
      expect(defaultMarkdownStyles.blockquote.borderLeft?.color).toBeDefined();
    });

    it('块引用应该有背景配置', () => {
      expect(defaultMarkdownStyles.blockquote.background).toBeDefined();
      expect(defaultMarkdownStyles.blockquote.background?.color).toBeDefined();
      expect(defaultMarkdownStyles.blockquote.background?.padding).toBeGreaterThan(0);
    });

    it('列表应该有列表样式配置', () => {
      expect(defaultMarkdownStyles.unorderedList.listStyle).toBeDefined();
      expect(defaultMarkdownStyles.unorderedList.listStyle?.type).toBe('bullet');
      expect(defaultMarkdownStyles.unorderedList.listStyle?.indent).toBeGreaterThan(0);

      expect(defaultMarkdownStyles.orderedList.listStyle).toBeDefined();
      expect(defaultMarkdownStyles.orderedList.listStyle?.type).toBe('number');
      expect(defaultMarkdownStyles.orderedList.listStyle?.indent).toBeGreaterThan(0);
    });
  });

  describe('defaultMarkdownConfig', () => {
    it('应该启用 enabled 为 true', () => {
      expect(defaultMarkdownConfig.enabled).toBe(true);
    });

    it('应该包含默认样式', () => {
      expect(defaultMarkdownConfig.styles).toEqual(defaultMarkdownStyles);
    });
  });

  describe('mergeMarkdownStyle', () => {
    const baseStyle: MarkdownStyle = {
      fontSize: 24,
      fontWeight: 400,
      letterSpacing: 0,
      inkColor: '#3a2e1f',
      lineHeight: 1.8,
      marginTop: 0,
      marginBottom: 16,
    };

    it('应该正确合并覆盖基础样式和覆盖样式', () => {
      const overrides: Partial<MarkdownStyle> = {
        fontSize: 36,
        fontWeight: 700,
        inkColor: '#ff0000',
      };

      const result = mergeMarkdownStyle(baseStyle, overrides);

      expect(result.fontSize).toBe(36);
      expect(result.fontWeight).toBe(700);
      expect(result.inkColor).toBe('#ff0000');
      expect(result.letterSpacing).toBe(baseStyle.letterSpacing);
      expect(result.lineHeight).toBe(baseStyle.lineHeight);
      expect(result.marginTop).toBe(baseStyle.marginTop);
      expect(result.marginBottom).toBe(baseStyle.marginBottom);
    });

    it('空覆盖应该返回基础样式的副本', () => {
      const result = mergeMarkdownStyle(baseStyle, {});
      expect(result).toEqual(baseStyle);
      expect(result).not.toBe(baseStyle);
    });

    it('应该正确添加新属性', () => {
      const overrides: Partial<MarkdownStyle> = {
        paddingLeft: 24,
        borderLeft: {
          width: 4,
          color: '#c9a67a',
          offset: 12,
        },
      };

      const result = mergeMarkdownStyle(baseStyle, overrides);

      expect(result.paddingLeft).toBe(24);
      expect(result.borderLeft).toEqual({
        width: 4,
        color: '#c9a67a',
        offset: 12,
      });
    });

    it('应该正确覆盖嵌套对象', () => {
      const baseWithNested: MarkdownStyle = {
        ...baseStyle,
        borderLeft: {
          width: 2,
          color: '#000000',
          offset: 10,
        },
      };

      const overrides: Partial<MarkdownStyle> = {
        borderLeft: {
          width: 6,
          color: '#ff0000',
          offset: 20,
        },
      };

      const result = mergeMarkdownStyle(baseWithNested, overrides);

      expect(result.borderLeft?.width).toBe(6);
      expect(result.borderLeft?.color).toBe('#ff0000');
      expect(result.borderLeft?.offset).toBe(20);
    });

    it('应该不修改原始基础样式', () => {
      const originalBase = { ...baseStyle };
      const overrides: Partial<MarkdownStyle> = { fontSize: 100 };

      mergeMarkdownStyle(baseStyle, overrides);

      expect(baseStyle.fontSize).toBe(originalBase.fontSize);
    });

    it('应该正确处理列表样式覆盖', () => {
      const baseWithList: MarkdownStyle = {
        ...baseStyle,
        listStyle: {
          type: 'bullet',
          indent: 28,
        },
      };

      const overrides: Partial<MarkdownStyle> = {
        listStyle: {
          type: 'number',
          indent: 32,
        },
      };

      const result = mergeMarkdownStyle(baseWithList, overrides);

      expect(result.listStyle?.type).toBe('number');
      expect(result.listStyle?.indent).toBe(32);
    });

    it('应该正确处理背景样式覆盖', () => {
      const baseWithBg: MarkdownStyle = {
        ...baseStyle,
        background: {
          color: 'rgba(0,0,0,0.1)',
          padding: 10,
          borderRadius: 4,
        },
      };

      const overrides: Partial<MarkdownStyle> = {
        background: {
          color: 'rgba(255,0,0,0.2)',
          padding: 15,
          borderRadius: 8,
        },
      };

      const result = mergeMarkdownStyle(baseWithBg, overrides);

      expect(result.background?.color).toBe('rgba(255,0,0,0.2)');
      expect(result.background?.padding).toBe(15);
      expect(result.background?.borderRadius).toBe(8);
    });

    it('应该正确处理 jitterAmount 覆盖', () => {
      const overrides: Partial<MarkdownStyle> = {
        jitterAmount: 0.8,
      };

      const result = mergeMarkdownStyle(baseStyle, overrides);

      expect(result.jitterAmount).toBe(0.8);
    });

    it('应该正确处理 fontFamily 和 fontId 覆盖', () => {
      const overrides: Partial<MarkdownStyle> = {
        fontFamily: 'Custom Font',
        fontId: 'custom-font-id',
      };

      const result = mergeMarkdownStyle(baseStyle, overrides);

      expect(result.fontFamily).toBe('Custom Font');
      expect(result.fontId).toBe('custom-font-id');
    });
  });
});
