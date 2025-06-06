import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  filePath: string;
  currentPage: number;
  totalPages: number;
  lastRead: Date;
  progress: number;
  favorite: boolean;
  tags: string[];
  addedDate: Date;
  readingTime: number; // in minutes
}

export interface ReadingSession {
  bookId: string;
  startTime: Date;
  endTime?: Date;
  pagesRead: number;
}


interface LibraryContextType {
  books: Book[];
  currentlyReading: Book[];
  recentlyRead: Book[];
  favorites: Book[];
  addBook: (book: Omit<Book, 'id' | 'addedDate'>) => Promise<void>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  getBook: (bookId: string) => Book | undefined;
  startReadingSession: (bookId: string) => void;
  endReadingSession: (pagesRead: number) => void;
  isLoading: boolean;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const parseEpub = async (fileUri: string): Promise<Omit<Book, 'id'>> => {
  const epub = new Epub(fileUri);
  const metadata = await epub.getMetadata();
  
  return {
    title: metadata.title || 'Unknown Title',
    author: metadata.creator || 'Unknown Author',
    cover: metadata.cover || 'https://placeholder.com/book.png',
    filePath: fileUri,
    currentPage: 1,
    totalPages: await epub.getTotalLocations(),
    lastRead: new Date(),
    progress: 0,
    favorite: false,
    tags: [],
    addedDate: new Date(),
    readingTime: 0
  };
};
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock books for demonstration
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      cover: 'https://images.pexels.com/photos/4842656/pexels-photo-4842656.jpeg?auto=compress&cs=tinysrgb&w=400',
      currentPage: 45,
      totalPages: 432,
      lastRead: new Date(Date.now() - 86400000),
      progress: 10.4,
      favorite: true,
      tags: ['Romance', 'Classic'],
      addedDate: new Date(Date.now() - 7 * 86400000),
      readingTime: 180,
    },
    {
      id: '2',
      title: 'The Enchanted Garden',
      author: 'Luna Rosewood',
      cover: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400',
      currentPage: 0,
      totalPages: 298,
      lastRead: new Date(),
      progress: 0,
      favorite: false,
      tags: ['Fantasy', 'Romance'],
      addedDate: new Date(),
      readingTime: 0,
    },
    {
      id: '3',
      title: 'Moonlit Whispers',
      author: 'Isabella Nightingale',
      cover: 'https://images.pexels.com/photos/3847579/pexels-photo-3847579.jpeg?auto=compress&cs=tinysrgb&w=400',
      currentPage: 156,
      totalPages: 267,
      lastRead: new Date(Date.now() - 2 * 86400000),
      progress: 58.4,
      favorite: true,
      tags: ['Romance', 'Contemporary'],
      addedDate: new Date(Date.now() - 14 * 86400000),
      readingTime: 420,
    },
  ];

  // const addBook = async (bookData: Omit<Book, 'id' | 'addedDate'>) => {
  //   const newBook: Book = {
  //     ...bookData,
  //     id: Date.now().toString(),
  //     addedDate: new Date(),
  //   };
    
  //   const updatedBooks = [...books, newBook];
  //   setBooks(updatedBooks);
  //   await AsyncStorage.setItem('library', JSON.stringify(updatedBooks));
  // };

  const addBook = async (fileUri: string) => {
    try {
      const bookData = await parseEpub(fileUri);
      const newBook: Book = {
        ...bookData,
        id: Date.now().toString(),
      };
      
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      await AsyncStorage.setItem('library', JSON.stringify(updatedBooks));
      return newBook;
    } catch (error) {
      console.error('Error adding EPUB:', error);
      throw error;
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    const updatedBooks = books.map(book =>
      book.id === bookId ? { ...book, ...updates } : book
    );
    setBooks(updatedBooks);
    await AsyncStorage.setItem('library', JSON.stringify(updatedBooks));
  };

  const removeBook = async (bookId: string) => {
    const updatedBooks = books.filter(book => book.id !== bookId);
    setBooks(updatedBooks);
    await AsyncStorage.setItem('library', JSON.stringify(updatedBooks));
  };

  const getBook = (bookId: string) => {
    return books.find(book => book.id === bookId);
  };

  const startReadingSession = (bookId: string) => {
    setCurrentSession({
      bookId,
      startTime: new Date(),
      pagesRead: 0,
    });
  };

  const endReadingSession = async (pagesRead: number) => {
    if (currentSession) {
      const sessionDuration = Date.now() - currentSession.startTime.getTime();
      const minutesRead = Math.round(sessionDuration / 60000);
      
      await updateBook(currentSession.bookId, {
        readingTime: (getBook(currentSession.bookId)?.readingTime || 0) + minutesRead,
        lastRead: new Date(),
      });
      
      setCurrentSession(null);
    }
  };

  const refreshLibrary = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const currentlyReading = books.filter(book => book.progress > 0 && book.progress < 100);
  const recentlyRead = books
    .filter(book => book.lastRead)
    .sort((a, b) => b.lastRead.getTime() - a.lastRead.getTime())
    .slice(0, 5);
  const favorites = books.filter(book => book.favorite);

  useEffect(() => {
    // const loadLibrary = async () => {
    //   try {
    //     const savedLibrary = await AsyncStorage.getItem('library');
    //     if (savedLibrary) {
    //       setBooks(JSON.parse(savedLibrary));
    //     } else {
    //       // Load mock data on first run
    //       setBooks(mockBooks);
    //       await AsyncStorage.setItem('library', JSON.stringify(mockBooks));
    //     }
    //   } catch (error) {
    //     console.error('Error loading library:', error);
    //     setBooks(mockBooks);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    const loadLibrary = async () => {
      try {
        const savedLibrary = await AsyncStorage.getItem('library');
        if (savedLibrary) {
          const parsedBooks = JSON.parse(savedLibrary).map((book: any) => ({
            ...book,
            lastRead: new Date(book.lastRead),
            addedDate: new Date(book.addedDate),
          }));
          setBooks(parsedBooks);
        } else {
          // Load mock data on first run
          setBooks(mockBooks);
          await AsyncStorage.setItem('library', JSON.stringify(mockBooks));
        }
      } catch (error) {
        console.error('Error loading library:', error);
        setBooks(mockBooks);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLibrary();
  }, []);

  return (
    <LibraryContext.Provider value={{
      books,
      currentlyReading,
      recentlyRead,
      favorites,
      addBook,
      updateBook,
      removeBook,
      getBook,
      startReadingSession,
      endReadingSession,
      isLoading,
      refreshLibrary,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}