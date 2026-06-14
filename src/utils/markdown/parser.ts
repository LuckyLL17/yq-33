import type { MarkdownBlock, MarkdownTextSegment } from './types';

function parseInlineSegments(text: string): MarkdownTextSegment[] {
  const segments: MarkdownTextSegment[] = [];
  let remaining = text;
  
  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/, type: 'boldItalic' as const },
    { regex: /___(.+?)___/, type: 'boldItalic' as const },
    { regex: /\*\*(.+?)\*\*/, type: 'bold' as const },
    { regex: /__(.+?)__/, type: 'bold' as const },
    { regex: /\*(.+?)\*/, type: 'italic' as const },
    { regex: /_(.+?)_/, type: 'italic' as const },
    { regex: /~~(.+?)~~/, type: 'strikethrough' as const },
    { regex: /`(.+?)`/, type: 'code' as const },
    { regex: /\[(.+?)\]\((.+?)\)/, type: 'link' as const },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; type: MarkdownTextSegment['type']; content: string; href?: string } | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        if (earliestMatch === null || match.index < earliestMatch.index) {
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            type: pattern.type,
            content: match[1],
            href: pattern.type === 'link' ? match[2] : undefined,
          };
        }
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        segments.push({
          type: 'text',
          text: remaining.slice(0, earliestMatch.index),
        });
      }
      segments.push({
        type: earliestMatch.type,
        text: earliestMatch.content,
        href: earliestMatch.href,
      });
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      segments.push({
        type: 'text',
        text: remaining,
      });
      break;
    }
  }

  return segments;
}

function parseListItems(lines: string[], startIndex: number, ordered: boolean): { items: MarkdownBlock[]; endIndex: number } {
  const items: MarkdownBlock[] = [];
  let i = startIndex;
  const listRegex = ordered ? /^\s*(\d+)[.)]\s+(.*)/ : /^\s*[-*+]\s+(.*)/;

  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(listRegex);
    
    if (match) {
      const content = ordered ? match[2] : match[1];
      items.push({
        type: 'listItem',
        content,
        segments: parseInlineSegments(content),
      });
      i++;
    } else if (line.trim() === '') {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.match(listRegex)) {
        i++;
        continue;
      }
      break;
    } else {
      break;
    }
  }

  return { items, endIndex: i };
}

export function parseMarkdown(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.replace(/\r\n|\r/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    const h1Match = trimmed.match(/^#\s+(.+)/);
    if (h1Match) {
      blocks.push({
        type: 'heading1',
        content: h1Match[1],
        segments: parseInlineSegments(h1Match[1]),
        level: 1,
      });
      i++;
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) {
      blocks.push({
        type: 'heading2',
        content: h2Match[1],
        segments: parseInlineSegments(h2Match[1]),
        level: 2,
      });
      i++;
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.+)/);
    if (h3Match) {
      blocks.push({
        type: 'heading3',
        content: h3Match[1],
        segments: parseInlineSegments(h3Match[1]),
        level: 3,
      });
      i++;
      continue;
    }

    const blockquoteLines: string[] = [];
    while (i < lines.length && lines[i].trim().startsWith('>')) {
      blockquoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
      i++;
    }
    if (blockquoteLines.length > 0) {
      const content = blockquoteLines.join('\n');
      blocks.push({
        type: 'blockquote',
        content,
        segments: parseInlineSegments(content),
      });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+/);
    if (unorderedMatch) {
      const { items, endIndex } = parseListItems(lines, i, false);
      blocks.push({
        type: 'unorderedList',
        content: '',
        segments: [],
        listItems: items,
      });
      i = endIndex;
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+/);
    if (orderedMatch) {
      const { items, endIndex } = parseListItems(lines, i, true);
      blocks.push({
        type: 'orderedList',
        content: '',
        segments: [],
        listItems: items,
      });
      i = endIndex;
      continue;
    }

    const paragraphLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trim();
      
      if (nextTrimmed === '') break;
      if (nextTrimmed.match(/^#+\s+/)) break;
      if (nextTrimmed.startsWith('>')) break;
      if (nextTrimmed.match(/^[-*+]\s+/)) break;
      if (nextTrimmed.match(/^\d+[.)]\s+/)) break;
      
      paragraphLines.push(nextLine);
      i++;
    }
    
    const content = paragraphLines.join(' ');
    blocks.push({
      type: 'paragraph',
      content,
      segments: parseInlineSegments(content),
    });
  }

  return blocks;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}
