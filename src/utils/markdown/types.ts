export type MarkdownElementType = 
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'paragraph'
  | 'blockquote'
  | 'unorderedList'
  | 'orderedList'
  | 'listItem'
  | 'bold'
  | 'italic'
  | 'boldItalic'
  | 'strikethrough'
  | 'code'
  | 'link'
  | 'text';

export interface MarkdownStyle {
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  inkColor: string;
  fontFamily?: string;
  fontId?: string;
  jitterAmount?: number;
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  paddingLeft?: number;
  borderLeft?: {
    width: number;
    color: string;
    offset: number;
  };
  background?: {
    color: string;
    padding: number;
    borderRadius: number;
  };
  listStyle?: {
    type: 'bullet' | 'number' | 'dash';
    indent: number;
  };
}

export interface MarkdownTextSegment {
  type: 'text' | 'bold' | 'italic' | 'boldItalic' | 'strikethrough' | 'code' | 'link';
  text: string;
  href?: string;
}

export interface MarkdownBlock {
  type: MarkdownElementType;
  content: string;
  segments: MarkdownTextSegment[];
  level?: number;
  listItems?: MarkdownBlock[];
  indentLevel?: number;
}

export interface MarkdownConfig {
  enabled: boolean;
  styles: Record<MarkdownElementType, MarkdownStyle>;
}
