import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic
} from '@expo-google-fonts/playfair-display';
import {
  CrimsonText_400Regular,
  CrimsonText_600SemiBold,
  CrimsonText_400Regular_Italic
} from '@expo-google-fonts/crimson-text';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
  LibreBaskerville_400Regular_Italic
} from '@expo-google-fonts/libre-baskerville';
import {
  Merriweather_400Regular,
  Merriweather_700Bold,
  Merriweather_400Regular_Italic
} from '@expo-google-fonts/merriweather';
import {
  EBGaramond_400Regular,
  EBGaramond_700Bold,
  EBGaramond_400Regular_Italic
} from '@expo-google-fonts/eb-garamond';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

interface FontContextType {
  fontsLoaded: boolean;
  fontError: Error | null;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'PlayfairDisplay-Italic': PlayfairDisplay_400Regular_Italic,
    'CrimsonText-Regular': CrimsonText_400Regular,
    'CrimsonText-SemiBold': CrimsonText_600SemiBold,
    'CrimsonText-Italic': CrimsonText_400Regular_Italic,
    'LibreBaskerville-Regular': LibreBaskerville_400Regular,
    'LibreBaskerville-Bold': LibreBaskerville_700Bold,
    'LibreBaskerville-Italic': LibreBaskerville_400Regular_Italic,
    'Merriweather-Regular': Merriweather_400Regular,
    'Merriweather-Bold': Merriweather_700Bold,
    'Merriweather-Italic': Merriweather_400Regular_Italic,
    'EBGaramond-Regular': EBGaramond_400Regular,
    'EBGaramond-Bold': EBGaramond_700Bold,
    'EBGaramond-Italic': EBGaramond_400Regular_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <FontContext.Provider value={{ fontsLoaded, fontError }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFontContext() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFontContext must be used within FontProvider');
  }
  return context;
}