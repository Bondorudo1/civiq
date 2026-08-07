import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
  useFonts,
} from '@expo-google-fonts/rubik';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

// Light theme only (dark theme intentionally not supported).
const CiviqLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.surface,
    primary: Colors.light.brand,
    text: Colors.light.text,
    border: Colors.light.line,
  },
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) {
    return null;
  }

  const isAuthed = !!token;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
        <ThemeProvider value={CiviqLight}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isAuthed}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="project/[id]" />
              <Stack.Screen name="complaint/new" />
              <Stack.Screen name="complaint/[id]" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthed}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </Stack.Protected>
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
