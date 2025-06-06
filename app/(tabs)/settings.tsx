import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useReader } from '@/contexts/ReaderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFontContext } from '@/contexts/FontContext';
import { router } from 'expo-router';
import {
  User,
  Palette,
  Type,
  BookOpen,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Heart,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { currentTheme, themeName, setTheme, isDark } = useTheme();
  const { settings, updateSettings } = useReader();
  const { user, logout } = useAuth();
  const { fontsLoaded } = useFontContext();

  if (!fontsLoaded || !user) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>
          Loading settings...
        </Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderSettingItem = (
    icon: any,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showChevron = true
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: currentTheme.accent + '20' }]}>
          {React.createElement(icon, { size: 20, color: currentTheme.accent })}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight size={16} color={currentTheme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const themeOptions = [
    { key: 'light', name: 'Classic Light', description: 'Clean and bright' },
    { key: 'dark', name: 'Midnight Dark', description: 'Easy on the eyes' },
    { key: 'romantic', name: 'Romantic Rose', description: 'Warm and enchanting' },
  ];

  const fontOptions = [
    'Playfair Display',
    'Crimson Text',
    'Libre Baskerville',
    'Merriweather',
    'EB Garamond',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <LinearGradient
        colors={[currentTheme.primary + '10', currentTheme.background]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
            Settings
          </Text>
          <Text style={[styles.screenSubtitle, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
            Customize your reading experience
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection(
          'Account',
          <>
            {renderSettingItem(
              User,
              'Profile',
              `Signed in as ${user.email}`,
              () => {},
            )}
          </>
        )}

        {renderSection(
          'Appearance',
          <>
            {renderSettingItem(
              Palette,
              'Theme',
              `Current: ${themeOptions.find(t => t.key === themeName)?.name || 'Light'}`,
              () => {
                Alert.alert(
                  'Choose Theme',
                  'Select your preferred reading theme',
                  themeOptions.map(theme => ({
                    text: theme.name,
                    onPress: () => setTheme(theme.key as any),
                  })).concat([{ text: 'Cancel', style: 'cancel' }])
                );
              }
            )}
            {renderSettingItem(
              isDark ? Moon : Sun,
              'Night Mode',
              'Automatically enabled with dark theme',
              () => {},
              <Switch
                value={isDark}
                onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                trackColor={{ false: currentTheme.border, true: currentTheme.accent }}
                thumbColor="white"
              />,
              false
            )}
          </>
        )}

        {renderSection(
          'Reading Experience',
          <>
            {renderSettingItem(
              Type,
              'Font Family',
              `Current: ${settings.fontFamily}`,
              () => {
                Alert.alert(
                  'Choose Font',
                  'Select your preferred reading font',
                  fontOptions.map(font => ({
                    text: font,
                    onPress: () => updateSettings({ fontFamily: font }),
                  })).concat([{ text: 'Cancel', style: 'cancel' }])
                );
              }
            )}
            {renderSettingItem(
              BookOpen,
              'Font Size',
              `Current: ${settings.fontSize}px`,
              () => {
                const sizes = [12, 14, 16, 18, 20, 22, 24];
                Alert.alert(
                  'Font Size',
                  'Choose your preferred font size',
                  sizes.map(size => ({
                    text: `${size}px`,
                    onPress: () => updateSettings({ fontSize: size }),
                  })).concat([{ text: 'Cancel', style: 'cancel' }])
                );
              }
            )}
            {renderSettingItem(
              SettingsIcon,
              'Text Justification',
              'Align text for better readability',
              () => {},
              <Switch
                value={settings.justifyText}
                onValueChange={(value) => updateSettings({ justifyText: value })}
                trackColor={{ false: currentTheme.border, true: currentTheme.accent }}
                thumbColor="white"
              />,
              false
            )}
          </>
        )}

        {renderSection(
          'Account Actions',
          <>
            {renderSettingItem(
              LogOut,
              'Sign Out',
              'You can always sign back in',
              handleLogout,
              null,
              false
            )}
          </>
        )}

        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <Heart size={20} color={currentTheme.accent} fill={currentTheme.accent} />
            <Text style={[styles.appName, { color: currentTheme.text, fontFamily: 'PlayfairDisplay-Bold' }]}>
              Enchanted Reader
            </Text>
          </View>
          <Text style={[styles.version, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.footerText, { color: currentTheme.textSecondary, fontFamily: 'CrimsonText-Regular' }]}>
            Made with love for book enthusiasts
          </Text>
        </View>

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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 18,
    marginLeft: 8,
  },
  version: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});