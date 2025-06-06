import React, { useState, useEffect, useRef } from 'react';
// import { ScrollView } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useReader } from '@/contexts/ReaderContext';
import { useFontContext } from '@/contexts/FontContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bookmark,
  Settings,
  Palette,
  Type,
  Highlighter,
  StickyNote,
  Pen,
  Sun,
  Moon,
} from 'lucide-react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import ReaderPage from '@/components/ReaderPage';
import AnnotationToolbar from '@/components/AnnotationToolbar';
import ColorPicker from '@/components/ColorPicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams();
  const { currentTheme, setAdaptiveTheme } = useTheme();
  const { getBook, updateBook } = useLibrary();
  const { settings, updateSettings, addAnnotation, addBookmark } = useReader();
  const { fontsLoaded } = useFontContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [annotationMode, setAnnotationMode] = useState<'none' | 'highlight' | 'note' | 'draw'>('none');
  const [selectedColor, setSelectedColor] = useState('#FFE082');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const book = getBook(bookId as string);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);

  // Mock book content - in a real app, this would be loaded from the EPUB file
  const mockPages = Array.from({ length: book?.totalPages || 100 }, (_, i) => ({
    pageNumber: i + 1,
    content: `This is page ${i + 1} of "${book?.title}". 
    
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

${i % 5 === 0 ? '🌟 This is a special highlighted section that would be perfect for annotation! 🌟' : ''}

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos perspiciatis hic porro dolor quos reprehenderit repudiandae deserunt modi laborum. Soluta, voluptate voluptas? Optio doloremque doloribus fugiat in earum temporibus eveniet. Ex placeat beatae eaque aperiam sunt praesentium quis saepe. Sint temporibus sed, necessitatibus quisquam modi dolor id dignissimos ducimus doloremque corrupti, neque ab facere, esse voluptatibus obcaecati placeat reiciendis sunt accusamus facilis repellat iste fugit deserunt incidunt cum. Maxime iusto, quaerat excepturi repellat dignissimos accusamus nobis natus porro possimus odio nam ipsam, ad magnam commodi non nihil cumque impedit corrupti! Harum quibusdam ratione doloremque nesciunt quos ducimus maxime. Quas, sint!`,
  }));

  useEffect(() => {
    if (book && currentPage !== (book.currentPage || 1)) {
      setCurrentPage(book.currentPage || 1);
      const adaptiveColors = {
        primary: '#8B5A2B',
        accent: '#E91E63',
        background: '#FFF8E7',
      };
      setAdaptiveTheme(adaptiveColors);
    }
  }, [book, currentPage, setAdaptiveTheme]);
  

  const handleNextPage = () => {
    if (currentPage < (book?.totalPages || 100)) {
      setCurrentPage(currentPage + 1);
      updateProgress(currentPage + 1);
      translateX.value = 0;
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      updateProgress(currentPage - 1);
      translateX.value = 0;
    }
  };
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const shouldGoNext = event.translationX < -screenWidth / 3;
      const shouldGoPrev = event.translationX > screenWidth / 3;

      if (shouldGoNext && currentPage < (book?.totalPages || 100)) {
        translateX.value = withSpring(-screenWidth);
        runOnJS(handleNextPage)();
      } else if (shouldGoPrev && currentPage > 1) {
        translateX.value = withSpring(screenWidth);
        runOnJS(handlePrevPage)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });


  const updateProgress = (page: number) => {
    if (book) {
      const progress = (page / book.totalPages) * 100;
      updateBook(book.id, {
        currentPage: page,
        progress,
        lastRead: new Date(),
      });
    }
  };

  const toggleControls = () => {
    setShowControls(prev => {
      controlsOpacity.value = withTiming(prev ? 0 : 1, { duration: 300 });
      return !prev;
    });
  };

  const handleBookmark = () => {
    if (book) {
      setShowBookmarkModal(true);
    }
  };

  const saveBookmark = () => {
    if (book && bookmarkTitle.trim()) {
      addBookmark({
        bookId: book.id,
        page: currentPage,
        title: bookmarkTitle.trim(),
        note: bookmarkNote.trim() || undefined,
      });
      setBookmarkTitle('');
      setBookmarkNote('');
      setShowBookmarkModal(false);
      Alert.alert('Bookmark Saved', 'Your bookmark has been saved successfully.');
    }
  };

  const handleAnnotation = (type: 'highlight' | 'note' | 'draw', coordinates: any) => {
    console.log("we are doing something annotate");
    if (book) {
      addAnnotation({
        bookId: book.id,
        page: currentPage,
        type,
        color: selectedColor,
        coordinates,
        content: type === 'note' ? 'Sample note' : undefined,
      });
      setAnnotationMode('none');
    }
  };

  const pageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    };
  });

  const controlsStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  if (!fontsLoaded || !book) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading your book...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.pageContainer, pageStyle]}>
          <TouchableOpacity
            style={styles.tapArea}
            onPress={toggleControls}
            activeOpacity={1}
          >
            <ReaderPage
              page={mockPages[currentPage - 1]}
              settings={settings}
              theme={currentTheme}
              annotationMode={annotationMode}
              selectedColor={selectedColor}
              onAnnotation={handleAnnotation}
            />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Top Controls */}
      <Animated.View style={[styles.topControls, controlsStyle]}>
        <LinearGradient
          colors={[currentTheme.background + 'CC', 'transparent']}
          style={styles.controlsGradient}
        >
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: currentTheme.surface }]}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={currentTheme.text} />
            </TouchableOpacity>
            
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={[styles.pageInfo, { color: currentTheme.textSecondary }]}>
                Page {currentPage} of {book.totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: currentTheme.surface }]}
              onPress={() => setShowSettings(true)}
            >
              <Settings size={20} color={currentTheme.text} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View style={[styles.bottomControls, controlsStyle]}>
        <LinearGradient
          colors={['transparent', currentTheme.background + 'CC']}
          style={styles.controlsGradient}
        >
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: currentTheme.accent,
                    width: `${((currentPage - 1) / (book.totalPages - 1)) * 100}%`,
                  }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: currentTheme.surface }]}
              onPress={handleBookmark}
            >
              <Bookmark size={20} color={currentTheme.accent} />
            </TouchableOpacity>

            <AnnotationToolbar
              currentMode={annotationMode}
              onModeChange={setAnnotationMode}
              onColorPicker={() => setShowColorPicker(true)}
              theme={currentTheme}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Reading Settings
            </Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={[styles.doneButton, { color: currentTheme.accent }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            {/* Font Settings */}
            <View style={styles.settingSection}>
              <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
                Typography
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: currentTheme.textSecondary }]}>Font Size</Text>
                <View style={styles.fontSizeControls}>
                  <TouchableOpacity
                    style={[styles.fontButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
                    onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                  >
                    <Text style={[styles.fontButtonText, { color: currentTheme.text }]}>A-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.fontSize, { color: currentTheme.text }]}>{settings.fontSize}px</Text>
                  <TouchableOpacity
                    style={[styles.fontButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
                    onPress={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                  >
                    <Text style={[styles.fontButtonText, { color: currentTheme.text }]}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Theme Settings */}
            <View style={styles.settingSection}>
              <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
                Display
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: currentTheme.textSecondary }]}>Brightness</Text>
                <View style={styles.brightnessControls}>
                  <Sun size={16} color={currentTheme.textSecondary} />
                  <View style={[styles.slider, { backgroundColor: currentTheme.border }]}>
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          backgroundColor: currentTheme.accent,
                          width: `${settings.brightness}%`,
                        }
                      ]}
                    />
                  </View>
                  <Moon size={16} color={currentTheme.textSecondary} />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Bookmark Modal */}
      <Modal
        visible={showBookmarkModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookmarkModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Add Bookmark
            </Text>
            <TouchableOpacity onPress={() => setShowBookmarkModal(false)}>
              <Text style={[styles.cancelButton, { color: currentTheme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookmarkForm}>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="Bookmark title"
              placeholderTextColor={currentTheme.textSecondary}
              value={bookmarkTitle}
              onChangeText={setBookmarkTitle}
              autoFocus
            />
            
            <TextInput
              style={[styles.textArea, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border, color: currentTheme.text }]}
              placeholder="Add a note (optional)"
              placeholderTextColor={currentTheme.textSecondary}
              value={bookmarkNote}
              onChangeText={setBookmarkNote}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: currentTheme.accent }]}
              onPress={saveBookmark}
              disabled={!bookmarkTitle.trim()}
            >
              <Text style={styles.saveButtonText}>Save Bookmark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <ColorPicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={(color) => {
          setSelectedColor(color);
          setShowColorPicker(false);
        }}
        theme={currentTheme}
      />
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
  pageContainer: {
    flex: 1,
  },
  tapArea: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  controlsGradient: {
    padding: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  bookTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  pageInfo: {
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 30,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fontSize: {
    fontSize: 14,
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  brightnessControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  bookmarkForm: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});