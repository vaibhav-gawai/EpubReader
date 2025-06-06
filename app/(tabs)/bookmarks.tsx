import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useReader } from '@/contexts/ReaderContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFontContext } from '@/contexts/FontContext';
import { router } from 'expo-router';
import { Bookmark, Clock, Trash2, BookOpen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookmarksScreen() {
  const { currentTheme } = useTheme();
  const { bookmarks, removeBookmark } = useReader();
  const { getBook } = useLibrary();
  const { user } = useAuth();
  const { fontsLoaded } = useFontContext();

  if (!fontsLoaded || !user) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading your bookmarks...
        </Text>
      </View>
    );
  }

  const handleBookmarkPress = (bookmark: any) => {
    router.push(`/reader/${bookmark.bookId}?page=${bookmark.page}`);
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
  };

  const renderBookmark = (bookmark: any) => {
    const book = getBook(bookmark.bookId);
    if (!book) return null;

    return (
      <TouchableOpacity
        key={bookmark.id}
        style={[styles.bookmarkCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
        onPress={() => handleBookmarkPress(bookmark)}
        activeOpacity={0.8}
      >
        <View style={styles.bookmarkHeader}>
          <View style={styles.bookmarkInfo}>
            <Text style={[styles.bookmarkTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]} numberOfLines={1}>
              {bookmark.title}
            </Text>
            <Text style={[styles.bookTitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]} numberOfLines={1}>
              {book.title} by {book.author}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBookmark(bookmark.id)}
          >
            <Trash2 size={18} color={currentTheme.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.bookmarkMeta}>
          <View style={styles.metaItem}>
            <BookOpen size={14} color={currentTheme.textSecondary} />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
              Page {bookmark.page}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={currentTheme.textSecondary} />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
              {new Date(bookmark.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {bookmark.note && (
          <View style={[styles.noteContainer, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.noteText, { color: currentTheme.text, fontFamily: 'CrimsonText-Regular' }]}>
              "{bookmark.note}"
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <LinearGradient
        colors={[currentTheme.secondary + '10', currentTheme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            Your Bookmarks
          </Text>
          <Text style={[styles.screenSubtitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
            Revisit your favorite passages and important moments
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {bookmarks.length > 0 ? (
          <View style={styles.bookmarksSection}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              All Bookmarks ({bookmarks.length})
            </Text>
            {bookmarks
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(bookmark => renderBookmark(bookmark))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Bookmark size={64} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              No Bookmarks Yet
            </Text>
            <Text style={[styles.emptyMessage, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
              Start reading and create bookmarks to mark your favorite passages and important moments in your books.
            </Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: currentTheme.accent }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={[styles.browseButtonText, { fontFamily: 'CrimsonText-Regular' }]}>
                Start Reading
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  screenTitle: {
    fontSize: 28,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  bookmarksSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  bookmarkCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noteContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});