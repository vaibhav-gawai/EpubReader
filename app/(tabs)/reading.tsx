import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFontContext } from '@/contexts/FontContext';
import { router } from 'expo-router';
import { Clock, BookOpen, Target, TrendingUp, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ReadingScreen() {
  const { currentTheme } = useTheme();
  const { currentlyReading, books } = useLibrary();
  const { user } = useAuth();
  const { fontsLoaded } = useFontContext();

  if (!fontsLoaded || !user) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading your reading progress...
        </Text>
      </View>
    );
  }

  const totalBooksRead = books.filter(book => book.progress === 100).length;
  const totalReadingTime = books.reduce((total, book) => total + book.readingTime, 0);
  const averageProgress = books.length > 0 
    ? books.reduce((total, book) => total + book.progress, 0) / books.length 
    : 0;

  const readingStats = [
    {
      icon: BookOpen,
      label: 'Books Completed',
      value: totalBooksRead.toString(),
      color: currentTheme.success,
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: `${Math.round(totalReadingTime / 60)}h`,
      color: currentTheme.accent,
    },
    {
      icon: Target,
      label: 'Average Progress',
      value: `${Math.round(averageProgress)}%`,
      color: currentTheme.secondary,
    },
    {
      icon: TrendingUp,
      label: 'Books in Progress',
      value: currentlyReading.length.toString(),
      color: currentTheme.primary,
    },
  ];

  const renderStatCard = (stat: any, index: number) => (
    <View key={index} style={[styles.statCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        <stat.icon size={24} color={stat.color} />
      </View>
      <Text style={[styles.statValue, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
        {stat.value}
      </Text>
      <Text style={[styles.statLabel, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
        {stat.label}
      </Text>
    </View>
  );

  const renderCurrentlyReadingCard = (book: any) => (
    <TouchableOpacity
      key={book.id}
      style={[styles.currentBookCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
      onPress={() => router.push(`/reader/${book.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: book.cover }} style={styles.currentBookCover} />
      <View style={styles.currentBookInfo}>
        <Text style={[styles.currentBookTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.currentBookAuthor, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]} numberOfLines={1}>
          {book.author}
        </Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: currentTheme.textSecondary }]}>
              Page {book.currentPage} of {book.totalPages}
            </Text>
            <Text style={[styles.progressPercent, { color: currentTheme.accent, fontFamily: 'PlayfairDisplay-Bold' }]}>
              {Math.round(book.progress)}%
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: currentTheme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: currentTheme.accent, width: `${book.progress}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.bookMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color={currentTheme.textSecondary} />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
              {Math.round(book.readingTime / 60)}h read
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={14} color={currentTheme.textSecondary} />
            <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
              {new Date(book.lastRead).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <LinearGradient
        colors={[currentTheme.accent + '10', currentTheme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            Your Reading Journey
          </Text>
          <Text style={[styles.screenSubtitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
            Track your progress and discover new worlds
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            Reading Statistics
          </Text>
          <View style={styles.statsGrid}>
            {readingStats.map((stat, index) => renderStatCard(stat, index))}
          </View>
        </View>

        {currentlyReading.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Continue Reading
            </Text>
            {currentlyReading.map(book => renderCurrentlyReadingCard(book))}
          </View>
        )}

        {currentlyReading.length === 0 && (
          <View style={styles.emptyState}>
            <BookOpen size={64} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Start Your Reading Adventure
            </Text>
            <Text style={[styles.emptyMessage, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
              Choose a book from your library to begin your enchanted reading journey
            </Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: currentTheme.accent }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={[styles.browseButtonText, { fontFamily: 'CrimsonText-Regular' }]}>
                Browse Library
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
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  currentBookCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  currentBookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  currentBookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  currentBookTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentBookAuthor: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
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