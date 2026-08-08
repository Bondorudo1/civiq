import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
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

import { useMe } from '@/api/hooks';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';

SplashScreen.preventAutoHideAsync();

/**
 * Adopts the account's saved locale once it loads, so a returning resident who
 * chose Russian sees Russian on this device too. The Profil toggle sets the store
 * itself for an instant switch; this only reconciles from the server on load.
 * Renders nothing — it just needs to live under QueryClientProvider.
 */
function LocaleSync() {
  const { data: me } = useMe();
  const setLocale = useLocaleStore((s) => s.setLocale);
  useEffect(() => {
    if (me?.locale) setLocale(me.locale);
  }, [me?.locale, setLocale]);
  return null;
}

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
    IBMPlexMono_500Medium,
  });

  const token = useAuth((s) => s.token);
  const role = useAuth((s) => s.role);
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
  const isAdmin = role === 'ADMIN';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LocaleSync />
        <SafeAreaProvider>
        <ThemeProvider value={CiviqLight}>
          {/* Drilling into a detail slides in from the right (it lives "inside" the list).
              Crossing the auth boundary fades — it's a change of context, not of depth. */}
          {/* `title` is invisible on native (headers are hidden) but becomes the
              browser tab name on web — which is what a scanned QR link shows. */}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              title: 'CiviQ — Vocea ta pentru Cahul',
            }}>
            {/* The primărie panel is a separate shell, not a section of the citizen app. */}
            <Stack.Protected guard={isAuthed && isAdmin}>
              <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
              <Stack.Screen name="admin/complaint/[id]" />
              <Stack.Screen name="admin/post/new" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="admin/post/[id]" />
              <Stack.Screen name="admin/comments/[postId]" />
              <Stack.Screen name="admin/notification/new" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="admin/notification/[id]" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthed && !isAdmin}>
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="ask" />
              <Stack.Screen name="verify" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="project/[id]" />
              {/* Composing a complaint rises from the bottom: a task, not a destination. */}
              <Stack.Screen name="complaint/new" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="complaint/[id]" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthed}>
              <Stack.Screen name="login" options={{ animation: 'fade' }} />
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
