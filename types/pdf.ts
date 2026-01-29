// ============================================================================
// PDF MODULE TYPE DEFINITIONS
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Annotation types
export type AnnotationType = 'highlight' | 'underline' | 'drawing' | 'textbox' | 'sticky';

export type AnnotationColor = 'yellow' | 'green' | 'red' | 'amber' | 'blue';

export interface BaseAnnotation {
  id: string;
  page: number;
  type: AnnotationType;
  color: AnnotationColor;
  position: Rect;
  createdAt: Date;
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight';
}

export interface UnderlineAnnotation extends BaseAnnotation {
  type: 'underline';
}

export interface DrawingAnnotation extends BaseAnnotation {
  type: 'drawing';
  paths: Point[][];
  strokeWidth: number;
}

export interface TextboxAnnotation extends BaseAnnotation {
  type: 'textbox';
  content: string;
}

export interface StickyAnnotation extends BaseAnnotation {
  type: 'sticky';
  content: string;
}

export type Annotation = HighlightAnnotation | UnderlineAnnotation | DrawingAnnotation | TextboxAnnotation | StickyAnnotation;

// Bookmark
export interface Bookmark {
  id: string;
  page: number;
  title: string;
  createdAt: Date;
}

// Note with Markdown++
export interface Note {
  id: string;
  documentId?: string;
  page?: number;
  content: string; // Markdown++ format
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Parsed Markdown++ elements
export type MarkdownElementType = 'formula' | 'highlight' | 'definition' | 'warning' | 'normal' | 'heading';

export interface MarkdownElement {
  type: MarkdownElementType;
  content: string;
  metadata?: {
    tags?: string[];
    page?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    [key: string]: any;
  };
}

// Document metadata
export interface PDFDocument {
  id: string;
  uri: string;
  filename: string;
  fileSize: number;
  pageCount: number;
  currentPage: number;
  bookmarks: Bookmark[];
  annotations: Annotation[];
  notes: Note[];
  folder?: string;
  isFavorite: boolean;
  progress: number; // 0-100
  createdAt: Date;
  lastOpened: Date;
}

// Folder structure
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string; // For display: "1. Sınıf / Statik"
}

// Search result
export interface SearchResult {
  type: 'document' | 'note' | 'annotation' | 'bookmark';
  documentId: string;
  documentTitle: string;
  page?: number;
  snippet: string;
  score: number;
  tags?: string[];
}

// Library view mode
export type ViewMode = 'list' | 'grid';
export type SortBy = 'name' | 'date' | 'size' | 'progress';

// Search query
export interface SearchQuery {
  text: string;
  tags?: string[];
  folder?: string;
  dateRange?: { start: Date; end: Date };
}
