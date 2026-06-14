import { describe, it, expect } from 'vitest';
import { parseMarkdown, stripMarkdown } from '../../markdown/parser';
import type { MarkdownBlock, MarkdownTextSegment } from '../../markdown/types';

describe('markdown/parser - 纯函数单元测试', () => {
  describe('parseMarkdown', () => {
    it('应该正确解析纯文本段落', () => {
      const result = parseMarkdown('Hello World');
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('paragraph');
      expect(result[0].content).toBe('Hello World');
    });

    it('应该正确解析多级标题', () => {
      const result = parseMarkdown('# H1\n## H2\n### H3');
      expect(result.length).toBe(3);
      expect(result[0].type).toBe('heading1');
      expect(result[0].level).toBe(1);
      expect(result[0].content).toBe('H1');
      expect(result[1].type).toBe('heading2');
      expect(result[1].level).toBe(2);
      expect(result[1].content).toBe('H2');
      expect(result[2].type).toBe('heading3');
      expect(result[2].level).toBe(3);
      expect(result[2].content).toBe('H3');
    });

    it('应该正确解析无序列表', () => {
      const result = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('unorderedList');
      expect(result[0].listItems).toBeDefined();
      expect(result[0].listItems?.length).toBe(3);
      expect(result[0].listItems?.[0].type).toBe('listItem');
      expect(result[0].listItems?.[0].content).toBe('Item 1');
    });

    it('应该正确解析不同符号的无序列表', () => {
      const result1 = parseMarkdown('* Item 1\n* Item 2');
      expect(result1[0].type).toBe('unorderedList');
      expect(result1[0].listItems?.length).toBe(2);

      const result2 = parseMarkdown('+ Item 1\n+ Item 2');
      expect(result2[0].type).toBe('unorderedList');
      expect(result2[0].listItems?.length).toBe(2);
    });

    it('应该正确解析有序列表', () => {
      const result = parseMarkdown('1. First\n2. Second\n3. Third');
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('orderedList');
      expect(result[0].listItems?.length).toBe(3);
      expect(result[0].listItems?.[0].content).toBe('First');
      expect(result[0].listItems?.[1].content).toBe('Second');
    });

    it('应该正确解析带括号的有序列表', () => {
      const result = parseMarkdown('1) First\n2) Second');
      expect(result[0].type).toBe('orderedList');
      expect(result[0].listItems?.length).toBe(2);
    });

    it('应该正确解析块引用', () => {
      const result = parseMarkdown('> Quote line 1\n> Quote line 2');
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('blockquote');
      expect(result[0].content).toBe('Quote line 1\nQuote line 2');
    });

    it('应该正确解析内联粗体', () => {
      const result = parseMarkdown('**bold text**');
      expect(result[0].segments.length).toBe(1);
      expect(result[0].segments[0].type).toBe('bold');
      expect(result[0].segments[0].text).toBe('bold text');
    });

    it('应该正确解析下划线粗体', () => {
      const result = parseMarkdown('__bold text__');
      expect(result[0].segments[0].type).toBe('bold');
      expect(result[0].segments[0].text).toBe('bold text');
    });

    it('应该正确解析内联斜体', () => {
      const result = parseMarkdown('*italic text*');
      expect(result[0].segments[0].type).toBe('italic');
      expect(result[0].segments[0].text).toBe('italic text');
    });

    it('应该正确解析下划线斜体', () => {
      const result = parseMarkdown('_italic text_');
      expect(result[0].segments[0].type).toBe('italic');
      expect(result[0].segments[0].text).toBe('italic text');
    });

    it('应该正确解析粗斜体', () => {
      const result = parseMarkdown('***bold italic***');
      expect(result[0].segments[0].type).toBe('boldItalic');
      expect(result[0].segments[0].text).toBe('bold italic');
    });

    it('应该正确解析下划线粗斜体', () => {
      const result = parseMarkdown('___bold italic___');
      expect(result[0].segments[0].type).toBe('boldItalic');
      expect(result[0].segments[0].text).toBe('bold italic');
    });

    it('应该正确解析删除线', () => {
      const result = parseMarkdown('~~strikethrough~~');
      expect(result[0].segments[0].type).toBe('strikethrough');
      expect(result[0].segments[0].text).toBe('strikethrough');
    });

    it('应该正确解析行内代码', () => {
      const result = parseMarkdown('`code`');
      expect(result[0].segments[0].type).toBe('code');
      expect(result[0].segments[0].text).toBe('code');
    });

    it('应该正确解析链接', () => {
      const result = parseMarkdown('[link text](http://example.com)');
      expect(result[0].segments[0].type).toBe('link');
      expect(result[0].segments[0].text).toBe('link text');
      expect(result[0].segments[0].href).toBe('http://example.com');
    });

    it('应该正确解析混合内联格式', () => {
      const result = parseMarkdown('**bold** and *italic* and `code`');
      expect(result[0].segments.length).toBe(5);
      expect(result[0].segments[0].type).toBe('bold');
      expect(result[0].segments[2].type).toBe('italic');
      expect(result[0].segments[4].type).toBe('code');
    });

    it('应该正确解析段落中的内联格式', () => {
      const result = parseMarkdown('Normal **bold** normal *italic* normal');
      const segments = result[0].segments;
      expect(segments.length).toBeGreaterThanOrEqual(4);
      expect(segments.some((s: MarkdownTextSegment) => s.type === 'text')).toBe(true);
      expect(segments.some((s: MarkdownTextSegment) => s.type === 'bold')).toBe(true);
      expect(segments.some((s: MarkdownTextSegment) => s.type === 'italic')).toBe(true);
    });

    it('应该正确处理空行', () => {
      const result = parseMarkdown('Paragraph 1\n\nParagraph 2');
      expect(result.length).toBe(2);
      expect(result[0].type).toBe('paragraph');
      expect(result[1].type).toBe('paragraph');
    });

    it('应该正确处理开头和结尾的空行', () => {
      const result = parseMarkdown('\n\nText\n\n');
      expect(result.length).toBe(1);
      expect(result[0].content).toBe('Text');
    });

    it('应该正确处理 Windows 换行符', () => {
      const result = parseMarkdown('Line 1\r\nLine 2\r\n\r\nLine 3');
      expect(result.length).toBe(2);
    });

    it('应该正确解析列表项中的内联格式', () => {
      const result = parseMarkdown('- **bold** item\n- *italic* item');
      const list = result[0];
      expect(list.type).toBe('unorderedList');
      expect(list.listItems?.[0].segments.some((s: MarkdownTextSegment) => s.type === 'bold')).toBe(true);
      expect(list.listItems?.[1].segments.some((s: MarkdownTextSegment) => s.type === 'italic')).toBe(true);
    });

    it('应该正确解析多段落混合内容', () => {
      const md = `# Title

First paragraph with **bold** text.

## Subtitle

Second paragraph.

- Item 1
- Item 2
- Item 3

> Blockquote here
`;
      const result = parseMarkdown(md);
      expect(result.length).toBe(6);
      expect(result[0].type).toBe('heading1');
      expect(result[1].type).toBe('paragraph');
      expect(result[2].type).toBe('heading2');
      expect(result[3].type).toBe('paragraph');
      expect(result[4].type).toBe('unorderedList');
      expect(result[5].type).toBe('blockquote');
    });

    it('应该正确处理长段落自动合并', () => {
      const md = `This is a long
paragraph that spans
multiple lines.`;
      const result = parseMarkdown(md);
      expect(result.length).toBe(1);
      expect(result[0].content).toBe('This is a long paragraph that spans multiple lines.');
    });
  });

  describe('stripMarkdown', () => {
    it('应该移除标题标记', () => {
      expect(stripMarkdown('# Heading')).toBe('Heading');
      expect(stripMarkdown('## Subheading')).toBe('Subheading');
      expect(stripMarkdown('### Deep')).toBe('Deep');
    });

    it('应该移除块引用标记', () => {
      expect(stripMarkdown('> Quote')).toBe('Quote');
      expect(stripMarkdown('> Line 1\n> Line 2')).toBe('Line 1\nLine 2');
    });

    it('应该移除无序列表标记', () => {
      expect(stripMarkdown('- Item')).toBe('Item');
      expect(stripMarkdown('* Item')).toBe('Item');
      expect(stripMarkdown('+ Item')).toBe('Item');
    });

    it('应该移除有序列表标记', () => {
      expect(stripMarkdown('1. Item')).toBe('Item');
      expect(stripMarkdown('2) Item')).toBe('Item');
    });

    it('应该移除粗体标记', () => {
      expect(stripMarkdown('**bold**')).toBe('bold');
      expect(stripMarkdown('__bold__')).toBe('bold');
    });

    it('应该移除斜体标记', () => {
      expect(stripMarkdown('*italic*')).toBe('italic');
      expect(stripMarkdown('_italic_')).toBe('italic');
    });

    it('应该移除粗斜体标记', () => {
      expect(stripMarkdown('***bold italic***')).toBe('bold italic');
      expect(stripMarkdown('___bold italic___')).toBe('bold italic');
    });

    it('应该移除删除线标记', () => {
      expect(stripMarkdown('~~strike~~')).toBe('strike');
    });

    it('应该移除代码标记', () => {
      expect(stripMarkdown('`code`')).toBe('code');
    });

    it('应该将链接转换为纯文本', () => {
      expect(stripMarkdown('[text](url)')).toBe('text');
    });

    it('应该正确处理混合格式', () => {
      const md = '# Title\n\n**bold** and *italic* with `code` and [link](url)';
      const result = stripMarkdown(md);
      expect(result).toContain('Title');
      expect(result).toContain('bold');
      expect(result).toContain('italic');
      expect(result).toContain('code');
      expect(result).toContain('link');
      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
      expect(result).not.toContain('*italic*');
      expect(result).not.toContain('`');
      expect(result).not.toContain('[');
      expect(result).not.toContain('](');
    });

    it('应该正确处理多行内容', () => {
      const md = `# Heading

Paragraph with **bold**.

1. List item 1
2. List item 2

> Quote here`;
      const result = stripMarkdown(md);
      expect(result).toBe('Heading\n\nParagraph with bold.\nList item 1\nList item 2\nQuote here');
    });

    it('应该保留纯文本不变', () => {
      expect(stripMarkdown('Just plain text')).toBe('Just plain text');
    });

    it('应该正确处理空字符串', () => {
      expect(stripMarkdown('')).toBe('');
    });

    it('应该正确处理嵌套格式', () => {
      expect(stripMarkdown('***nested***')).toBe('nested');
      expect(stripMarkdown('**_nested_**')).toBe('nested');
    });
  });
});
