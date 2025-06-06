import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ReaderPageProps {
  page: {
    pageNumber: number;
    content: string;
  };
  settings: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    pageMargin: number;
    justifyText: boolean;
    nightMode: boolean;
    sepia: boolean;
    brightness: number;
  };
  theme: any;
  annotationMode: 'none' | 'highlight' | 'note' | 'draw';
  selectedColor: string;
  onAnnotation: (type: 'highlight' | 'note' | 'draw', coordinates: any) => void;
}

export default function ReaderPage({
  page,
  settings,
  theme,
  annotationMode,
  selectedColor,
  onAnnotation,
}: ReaderPageProps) {
  const handleTextSelection = (event: any) => {
    if (annotationMode === 'highlight') {
      const { pageX, pageY } = event.nativeEvent;
      onAnnotation('highlight', { x: pageX, y: pageY, width: 100, height: 20 });
    }
  };

  const handleNotePress = (event: any) => {
    if (annotationMode === 'note') {
      const { pageX, pageY } = event.nativeEvent;
      onAnnotation('note', { x: pageX, y: pageY });
    }
  };

  const pageBackgroundColor = settings.sepia 
    ? '#F5F1E8' 
    : settings.nightMode 
      ? theme.paper 
      : '#FFFEF7';

  const textColor = settings.nightMode ? theme.text : '#2C1810';

  return (
    <View style={[styles.container, { backgroundColor: pageBackgroundColor }]}>
      {/* Paper texture overlay */}
      <LinearGradient
        colors={[
          'rgba(139, 90, 43, 0.02)',
          'rgba(139, 90, 43, 0.01)',
          'rgba(139, 90, 43, 0.02)',
        ]}
        locations={[0, 0.5, 1]}
        style={styles.textureOverlay}
      />

      {/* Page number */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageNumber, { color: theme.textSecondary }]}>
          {page.pageNumber}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={[
          styles.contentPadding,
          { paddingHorizontal: settings.pageMargin }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleNotePress}
          onLongPress={handleTextSelection}
        >
          <Text
            style={[
              styles.contentText,
              {
                fontSize: settings.fontSize,
                fontFamily: `${settings.fontFamily.replace(' ', '')}-Regular`,
                lineHeight: settings.fontSize * settings.lineHeight,
                textAlign: settings.justifyText ? 'justify' : 'left',
                color: textColor,
              }
            ]}
          >
            {page.content}
          </Text>
        </TouchableOpacity>

        {/* Annotation highlights overlay */}
        {annotationMode === 'highlight' && (
          <View style={styles.highlightOverlay}>
            {/* Highlight indicators would be rendered here */}
          </View>
        )}

        {/* Sticky notes */}
        {annotationMode === 'note' && (
          <View style={styles.notesOverlay}>
            {/* Note indicators would be rendered here */}
          </View>
        )}
      </ScrollView>

      {/* Decorative elements for book-like appearance */}
      <View style={[styles.pageEdge, { backgroundColor: theme.border }]} />
      <View style={[styles.bindingEdge, { backgroundColor: theme.primary + '20' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  pageHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    zIndex: 2,
  },
  pageNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    zIndex: 2,
  },
  contentPadding: {
    paddingVertical: 20,
    paddingBottom: 60,
  },
  contentText: {
    textShadowColor: 'rgba(0, 0, 0, 0.01)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 0.5,
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  notesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  pageEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.3,
  },
  bindingEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.1,
  },
});