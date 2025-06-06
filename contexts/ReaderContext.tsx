import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Annotation {
  id: string;
  bookId: string;
  page: number;
  type: 'highlight' | 'note' | 'drawing';
  color: string;
  text?: string;
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content?: string; // For notes
  drawing?: string; // SVG path for drawings
  createdAt: Date;
  updatedAt: Date;
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  title: string;
  note?: string;
  createdAt: Date;
}

interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  pageMargin: number;
  justifyText: boolean;
  nightMode: boolean;
  sepia: boolean;
  brightness: number;
  pageTransition: 'slide' | 'fade' | 'curl';
}

interface ReaderContextType {
  annotations: Annotation[];
  bookmarks: Bookmark[];
  settings: ReaderSettings;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  getAnnotationsForPage: (bookId: string, page: number) => Annotation[];
  getBookmarksForBook: (bookId: string) => Bookmark[];
}

const defaultSettings: ReaderSettings = {
  fontSize: 16,
  fontFamily: 'Crimson Text',
  lineHeight: 1.6,
  pageMargin: 24,
  justifyText: true,
  nightMode: false,
  sepia: false,
  brightness: 100,
  pageTransition: 'curl',
};

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);

  const addAnnotation = (annotationData: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const annotation: Annotation = {
      ...annotationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAnnotations([...annotations, annotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(annotations.map(annotation =>
      annotation.id === id
        ? { ...annotation, ...updates, updatedAt: new Date() }
        : annotation
    ));
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(annotation => annotation.id !== id));
  };

  const addBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const bookmark: Bookmark = {
      ...bookmarkData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBookmarks([...bookmarks, bookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const getAnnotationsForPage = (bookId: string, page: number) => {
    return annotations.filter(annotation => 
      annotation.bookId === bookId && annotation.page === page
    );
  };

  const getBookmarksForBook = (bookId: string) => {
    return bookmarks.filter(bookmark => bookmark.bookId === bookId);
  };

  return (
    <ReaderContext.Provider value={{
      annotations,
      bookmarks,
      settings,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      addBookmark,
      removeBookmark,
      updateSettings,
      getAnnotationsForPage,
      getBookmarksForBook,
    }}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within ReaderProvider');
  }
  return context;
}