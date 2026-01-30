import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PDFDocument,
  Annotation,
  Bookmark,
  Note,
  Folder,
  SearchResult,
  ViewMode,
  SortBy,
  SearchQuery,
} from '@/types/pdf';
import { storage } from '@/utils/storage';

interface LibraryState {
  // Documents
  documents: PDFDocument[];
  currentDocument: PDFDocument | null;
  searchResults: SearchResult[];

  // Standalone notes (not linked to any document)
  standaloneNotes: Note[];

  // Folders
  folders: Folder[];
  currentFolder: string | null;

  // UI state
  viewMode: ViewMode;
  sortBy: SortBy;
  isSearching: boolean;

  // Actions - Documents
  addDocument: (document: Omit<PDFDocument, 'id' | 'createdAt' | 'lastOpened'>) => string;
  removeDocument: (id: string) => void;
  setCurrentDocument: (id: string) => void;
  updateCurrentPage: (page: number) => void;
  updateProgress: (id: string, progress: number) => void;
  toggleFavorite: (id: string) => void;
  setLastOpened: (id: string) => void;

  // Actions - Annotations
  addAnnotation: (documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  removeAnnotation: (documentId: string, annotationId: string) => void;
  updateAnnotation: (documentId: string, annotation: Annotation) => void;

  // Actions - Bookmarks
  addBookmark: (documentId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (documentId: string, bookmarkId: string) => void;

  // Actions - Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (noteId: string, content: string, tags?: string[]) => void;
  removeNote: (noteId: string) => void;
  getNotesByDocument: (documentId: string) => Note[];
  getStandaloneNotes: () => Note[];

  // Actions - Folders
  addFolder: (name: string, parentId: string | null) => string;
  removeFolder: (id: string) => void;
  setCurrentFolder: (id: string | null) => void;

  // Actions - Search
  search: (query: SearchQuery) => Promise<void>;
  clearSearch: () => void;

  // Actions - UI
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocument: null,
      searchResults: [],
      standaloneNotes: [],

      folders: [
        { id: 'root', name: 'Tümü', parentId: null, path: 'Tümü' },
        { id: 'recent', name: 'Son Okunanlar', parentId: null, path: 'Son Okunanlar' },
        { id: 'favorites', name: 'Favoriler', parentId: null, path: 'Favoriler' },
      ],
      currentFolder: null,

      viewMode: 'list',
      sortBy: 'date',
      isSearching: false,

      // Document Actions
      addDocument: (doc) => {
        const id = generateId();
        const now = new Date();
        const newDoc: PDFDocument = {
          ...doc,
          id,
          createdAt: now,
          lastOpened: now,
        };
        set((state) => ({ documents: [...state.documents, newDoc] }));
        return id;
      },

      removeDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        }));
      },

      setCurrentDocument: (id) => {
        const doc = get().documents.find((d) => d.id === id);
        if (doc) {
          set({ currentDocument: doc });
          get().setLastOpened(id);
        }
      },

      updateCurrentPage: (page) => {
        set((state) => ({
          currentDocument: state.currentDocument
            ? { ...state.currentDocument, currentPage: page }
            : null,
        }));
      },

      updateProgress: (id, progress) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, progress } : d
          ),
          currentDocument: state.currentDocument?.id === id
            ? { ...state.currentDocument, progress }
            : state.currentDocument,
        }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
          ),
          currentDocument: state.currentDocument?.id === id
            ? { ...state.currentDocument, isFavorite: !state.currentDocument.isFavorite }
            : state.currentDocument,
        }));
      },

      setLastOpened: (id) => {
        const now = new Date();
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, lastOpened: now } : d
          ),
        }));
      },

      // Annotation Actions
      addAnnotation: (documentId, annotation) => {
        const newAnnotation = {
          ...annotation,
          id: generateId(),
          createdAt: new Date(),
        } as Annotation;
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, annotations: [...doc.annotations, newAnnotation] }
              : doc
          ),
          currentDocument:
            state.currentDocument?.id === documentId
              ? { ...state.currentDocument, annotations: [...state.currentDocument.annotations, newAnnotation] }
              : state.currentDocument,
        }));
      },

      removeAnnotation: (documentId, annotationId) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, annotations: doc.annotations.filter((a) => a.id !== annotationId) }
              : doc
          ),
          currentDocument:
            state.currentDocument?.id === documentId
              ? { ...state.currentDocument, annotations: state.currentDocument.annotations.filter((a) => a.id !== annotationId) }
              : state.currentDocument,
        }));
      },

      updateAnnotation: (documentId, annotation) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  annotations: doc.annotations.map((a) =>
                    a.id === annotation.id ? annotation : a
                  ),
                }
              : doc
          ),
        }));
      },

      // Bookmark Actions
      addBookmark: (documentId, bookmark) => {
        const newBookmark: Bookmark = {
          ...bookmark,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, bookmarks: [...doc.bookmarks, newBookmark] }
              : doc
          ),
        }));
      },

      removeBookmark: (documentId, bookmarkId) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? { ...doc, bookmarks: doc.bookmarks.filter((b) => b.id !== bookmarkId) }
              : doc
          ),
        }));
      },

      // Note Actions
      addNote: (note) => {
        const id = generateId();
        const now = new Date();
        const newNote: Note = {
          ...note,
          id,
          createdAt: now,
          updatedAt: now,
        };

        // If note is linked to a document, add to document's notes
        if (note.documentId) {
          set((state) => ({
            documents: state.documents.map((doc) =>
              doc.id === note.documentId
                ? { ...doc, notes: [...doc.notes, newNote] }
                : doc
            ),
          }));
        } else {
          // Standalone note - add to standaloneNotes array
          set((state) => ({
            standaloneNotes: [...state.standaloneNotes, newNote],
          }));
        }

        return id;
      },

      updateNote: (noteId, content, tags) => {
        set((state) => {
          // Try to update in documents first
          const updatedDocuments = state.documents.map((doc) => ({
            ...doc,
            notes: doc.notes.map((note) =>
              note.id === noteId
                ? { ...note, content, tags: tags ?? note.tags, updatedAt: new Date() }
                : note
            ),
          }));

          // Check if note was found in documents
          const foundInDocs = state.documents.some((doc) =>
            doc.notes.some((note) => note.id === noteId)
          );

          if (foundInDocs) {
            return { documents: updatedDocuments };
          }

          // Otherwise update in standalone notes
          return {
            standaloneNotes: state.standaloneNotes.map((note) =>
              note.id === noteId
                ? { ...note, content, tags: tags ?? note.tags, updatedAt: new Date() }
                : note
            ),
          };
        });
      },

      removeNote: (noteId) => {
        set((state) => {
          // Try to remove from documents first
          const updatedDocuments = state.documents.map((doc) => ({
            ...doc,
            notes: doc.notes.filter((n) => n.id !== noteId),
          }));

          // Check if note was found in documents
          const foundInDocs = state.documents.some((doc) =>
            doc.notes.some((note) => note.id === noteId)
          );

          if (foundInDocs) {
            return { documents: updatedDocuments };
          }

          // Otherwise remove from standalone notes
          return {
            standaloneNotes: state.standaloneNotes.filter((n) => n.id !== noteId),
          };
        });
      },

      getNotesByDocument: (documentId) => {
        const doc = get().documents.find((d) => d.id === documentId);
        return doc?.notes ?? [];
      },

      getStandaloneNotes: () => {
        return get().standaloneNotes;
      },

      // Folder Actions
      addFolder: (name, parentId) => {
        const id = generateId();
        const parent = get().folders.find((f) => f.id === parentId);
        const path = parent ? `${parent.path} / ${name}` : name;

        set((state) => ({
          folders: [...state.folders, { id, name, parentId, path }],
        }));
        return id;
      },

      removeFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id && f.parentId !== id),
        }));
      },

      setCurrentFolder: (id) => {
        set({ currentFolder: id });
      },

      // Search Actions (basic implementation)
      search: async (query) => {
        set({ isSearching: true });

        // Simple in-memory search for now
        // TODO: Replace with SQLite FTS5
        const results: SearchResult[] = [];
        const { documents, standaloneNotes } = get();
        const searchText = query.text.toLowerCase();

        for (const doc of documents) {
          // Search in filename
          if (doc.filename.toLowerCase().includes(searchText)) {
            results.push({
              type: 'document',
              documentId: doc.id,
              documentTitle: doc.filename,
              snippet: doc.filename,
              score: 1,
            });
          }

          // Search in notes
          for (const note of doc.notes) {
            if (note.content.toLowerCase().includes(searchText)) {
              results.push({
                type: 'note',
                documentId: doc.id,
                documentTitle: doc.filename,
                page: note.page,
                snippet: note.content.substring(0, 100),
                score: 0.8,
                tags: note.tags,
              });
            }
          }

          // Search in bookmarks
          for (const bookmark of doc.bookmarks) {
            if (bookmark.title.toLowerCase().includes(searchText)) {
              results.push({
                type: 'bookmark',
                documentId: doc.id,
                documentTitle: doc.filename,
                page: bookmark.page,
                snippet: bookmark.title,
                score: 0.7,
              });
            }
          }
        }

        // Search in standalone notes
        for (const note of standaloneNotes) {
          if (note.content.toLowerCase().includes(searchText)) {
            results.push({
              type: 'note',
              documentId: '',
              documentTitle: 'Standalone Note',
              page: note.page,
              snippet: note.content.substring(0, 100),
              score: 0.8,
              tags: note.tags,
            });
          }
        }

        // Sort by score
        results.sort((a, b) => b.score - a.score);

        set({ searchResults: results, isSearching: false });
      },

      clearSearch: () => {
        set({ searchResults: [], isSearching: false });
      },

      // UI Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        documents: state.documents,
        folders: state.folders.filter(f => !['root', 'recent', 'favorites'].includes(f.id)),
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        standaloneNotes: state.standaloneNotes,
      }),
    }
  )
);
