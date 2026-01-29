// ============================================================================
// MARKDOWN++ PARSER FOR SMART NOTES
// ============================================================================

import type { MarkdownElement, MarkdownElementType } from '@/types/pdf';

/**
 * Parse custom Markdown++ syntax
 *
 * Supported patterns:
 * - ::önemli::text:: → Yellow highlight box
 * - ::formül::$formula$:: → KaTeX rendered with special style
 * - ::tanım::text:: → Definition card
 * - ::uyarı::text:: → Warning box
 * - @etiket:name → Tag extraction
 * - [[sayfa:47]] → PDF reference link
 * - [[doc:id]] → Document reference
 */
export class MarkdownParser {
  /**
   * Parse note content into structured elements
   */
  static parse(content: string): { elements: MarkdownElement[]; tags: string[]; references: Reference[] } {
    const elements: MarkdownElement[] = [];
    const tags: string[] = [];
    const references: Reference[] = [];

    // Split by lines for processing
    const lines = content.split('\n');
    let buffer: string[] = [];
    let currentType: MarkdownElementType = 'normal';
    let inCodeBlock = false;

    for (const line of lines) {
      // Check for code blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        buffer.push(line);
        continue;
      }

      if (inCodeBlock) {
        buffer.push(line);
        continue;
      }

      // Extract tags inline
      const tagMatches = line.matchAll(/@etiket:(\w+)/g);
      for (const match of tagMatches) {
        tags.push(match[1]);
      }

      // Extract references
      const pageRef = line.match(/\[\[sayfa:(\d+)\]\]/);
      if (pageRef) {
        references.push({ type: 'page', value: pageRef[1] });
      }

      const docRef = line.match(/\[\[doc:([^\]]+)\]\]/);
      if (docRef) {
        references.push({ type: 'document', value: docRef[1] });
      }

      // Check for block patterns
      if (line.startsWith('::önemli::')) {
        this.flushBuffer(elements, buffer, currentType);
        buffer = [line.replace('::önemli::', '')];
        currentType = 'highlight';
        continue;
      }

      if (line.startsWith('::formül::')) {
        this.flushBuffer(elements, buffer, currentType);
        buffer = [line.replace('::formül::', '')];
        currentType = 'formula';
        continue;
      }

      if (line.startsWith('::tanım::')) {
        this.flushBuffer(elements, buffer, currentType);
        buffer = [line.replace('::tanım::', '')];
        currentType = 'definition';
        continue;
      }

      if (line.startsWith('::uyarı::')) {
        this.flushBuffer(elements, buffer, currentType);
        buffer = [line.replace('::uyarı::', '')];
        currentType = 'warning';
        continue;
      }

      // Check for block end
      if (line.endsWith('::') && currentType !== 'normal' && currentType !== 'heading') {
        buffer.push(line.replace(/::$/, ''));
        this.flushBuffer(elements, buffer, currentType);
        buffer = [];
        currentType = 'normal';
        continue;
      }

      // Check for headings
      if (line.startsWith('#')) {
        this.flushBuffer(elements, buffer, currentType);
        buffer = [line];
        currentType = 'heading';
        continue;
      }

      buffer.push(line);
    }

    // Flush remaining buffer
    this.flushBuffer(elements, buffer, currentType);

    return { elements, tags, references };
  }

  /**
   * Flush buffered content as an element
   */
  private static flushBuffer(
    elements: MarkdownElement[],
    buffer: string[],
    type: MarkdownElementType
  ): void {
    if (buffer.length === 0) return;

    const content = buffer.join('\n').trim();
    if (content) {
      elements.push({ type, content });
    }
  }

  /**
   * Render elements back to Markdown (for editing)
   */
  static render(elements: MarkdownElement[]): string {
    return elements.map(el => {
      switch (el.type) {
        case 'highlight':
          return `::önemli::${el.content}::`;
        case 'formula':
          return `::formül::${el.content}::`;
        case 'definition':
          return `::tanım::${el.content}::`;
        case 'warning':
          return `::uyarı::${el.content}::`;
        default:
          return el.content;
      }
    }).join('\n\n');
  }

  /**
   * Extract math formulas from content
   */
  static extractFormulas(content: string): string[] {
    const formulas: string[] = [];
    const regex = /\$\$?([^$]+)\$\$?/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      formulas.push(match[1].trim());
    }

    return formulas;
  }

  /**
   * Check if content contains Turkish math keywords
   */
  static hasTurkishMath(content: string): boolean {
    const keywords = ['sigma', 'tau', 'epsilon', 'delta', 'toplam', 'integral', 'kök', 'gerilme', 'kayma'];
    const lower = content.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  }
}

interface Reference {
  type: 'page' | 'document';
  value: string;
}

/**
 * Convert parsed elements to React components config
 */
export function createElementConfig(elements: MarkdownElement[]) {
  return elements.map(el => {
    const config = {
      type: el.type,
      content: el.content,
      hasMath: el.content.includes('$') || MarkdownParser.hasTurkishMath(el.content),
      metadata: el.metadata,
    };

    // Extract inline tags
    const tagMatches = el.content.matchAll(/@etiket:(\w+)/g);
    const tags: string[] = [];
    for (const match of tagMatches) {
      tags.push(match[1]);
    }

    if (tags.length > 0) {
      config.metadata = { ...el.metadata, tags };
    }

    return config;
  });
}

/**
 * Quick pattern matchers for inline highlighting
 */
export const INLINE_PATTERNS = {
  formula: /::f:(.+?)::/g,
  important: /::!(.+?)::/g,
  definition: /::d:(.+?)::/g,
  tag: /@(\w+)/g,
  pageRef: /\[\[sayfa:(\d+)\]\]/g,
} as const;
