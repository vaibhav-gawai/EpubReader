import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFontContext } from '@/contexts/FontContext';
import { router } from 'expo-router';
import { Search, Plus, Filter, Heart, Clock, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LibraryScreen() {
  const { currentTheme } = useTheme();
  const { books, currentlyReading, recentlyRead, favorites, isLoading, refreshLibrary } = useLibrary();
  const { user } = useAuth();
  const { fontsLoaded } = useFontContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reading' | 'recent' | 'favorites'>('all');

  if (!fontsLoaded || !user) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          {!user ? 'Please log in to access your library' : 'Loading your enchanted library...'}
        </Text>
      </View>
    );
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedCategory) {
      case 'reading':
        return matchesSearch && currentlyReading.includes(book);
      case 'recent':
        return matchesSearch && recentlyRead.includes(book);
      case 'favorites':
        return matchesSearch && favorites.includes(book);
      default:
        return matchesSearch;
    }
  });

  const renderBookCard = (book: any, index: number) => (
    <TouchableOpacity
      key={book.id}
      style={[styles.bookCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
      onPress={() => router.push(`/reader/${book.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.bookCover}>
        <Image source={{ uri: book.cover }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.coverGradient}
        />
        {book.favorite && (
          <View style={[styles.favoriteIcon, { backgroundColor: currentTheme.accent }]}>
            <Heart size={12} color="white" fill="white" />
          </View>
        )}
        {book.progress > 0 && (
          <View style={[styles.progressBar, { backgroundColor: currentTheme.surface }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: currentTheme.accent, width: `${book.progress}%` }
              ]}
            />
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
            {book.progress > 0 ? `${Math.round(book.progress)}%` : 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, books: any[], showAll = false) => {
    if (books.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            {title}
          </Text>
          {!showAll && books.length > 2 && (
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: currentTheme.accent }]}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {(showAll ? books : books.slice(0, 6)).map((book, index) => renderBookCard(book, index))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <LinearGradient
        colors={[currentTheme.primary + '20', currentTheme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              {user.name}
            </Text>
          </View>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: currentTheme.accent }]}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshLibrary} tintColor={currentTheme.accent} />
        }
      >
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
            <Search size={20} color={currentTheme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: currentTheme.text, fontFamily: 'CrimsonText-Regular' }]}
              placeholder="Search your library..."
              placeholderTextColor={currentTheme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {[
              { key: 'all', label: 'All Books', icon: null },
              { key: 'reading', label: 'Reading', icon: Clock },
              { key: 'recent', label: 'Recent', icon: Star },
              { key: 'favorites', label: 'Favorites', icon: Heart },
            ].map(category => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.key ? currentTheme.accent : currentTheme.surface,
                    borderColor: currentTheme.border,
                  }
                ]}
                onPress={() => setSelectedCategory(category.key as any)}
              >
                {category.icon && (
                  <category.icon
                    size={16}
                    color={selectedCategory === category.key ? 'white' : currentTheme.textSecondary}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category.key ? 'white' : currentTheme.textSecondary,
                      fontFamily: 'CrimsonText-Regular'
                    }
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {searchQuery || selectedCategory !== 'all' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Search Results ({filteredBooks.length})
            </Text>
            <View style={styles.gridContainer}>
              {filteredBooks.map((book, index) => renderBookCard(book, index))}
            </View>
          </View>
        ) : (
          <>
            {renderSection('Continue Reading', currentlyReading)}
            {renderSection('Recently Added', recentlyRead)}
            {renderSection('Your Favorites', favorites)}
            {renderSection('All Books', books, true)}
          </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryFilter: {
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  bookCard: {
    width: 140,
    marginRight: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bookCover: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    marginBottom: 6,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});