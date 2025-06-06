import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { ReaderProvider } from '@/contexts/ReaderContext';
import { FontProvider } from '@/contexts/FontContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <FontProvider>
      <ThemeProvider>
        <AuthProvider>
          <LibraryProvider>
            <ReaderProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="reader/[bookId]" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ReaderProvider>
          </LibraryProvider>
        </AuthProvider>
      </ThemeProvider>
    </FontProvider>
  );
}