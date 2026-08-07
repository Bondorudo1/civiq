/**
 * CiviQ design tokens — "Nufăr Alb" / Enamel Civic (see PLAN.md §4, §12).
 * Cool lake-water base + lily-pad green + one coral petal accent.
 * Light theme only (dark theme intentionally not supported).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Compat keys consumed by themed-text / themed-view
    text: '#12303A', // ink-900
    textSecondary: '#5A7078', // ink-500
    background: '#F5F9FA', // app bg (barely-teal white)
    backgroundElement: '#FFFFFF', // surface / plaque
    backgroundSelected: '#EAF6F8', // water-wash (selected row)

    // Brand — lake water
    brand: '#0E7490',
    brandDeep: '#0B4F5A',
    brandBright: '#22A5BD',
    brandWash: '#EAF6F8',
    onBrand: '#FFFFFF',

    // Accent — coral petal (the single action/live accent)
    accent: '#F2637A',
    accentPressed: '#D94E66',
    accentWash: '#FDECEF',
    onAccent: '#12303A',

    // Support — lily pad
    green: '#2E7D5B',
    greenWash: '#E7F3EC',
    amber: '#B26A00',
    amberWash: '#FBEFD9',

    surface: '#FFFFFF',
    line: '#DCE6E9',
    muted: '#8A909B',

    // Enamel color-code for complaint status
    statusNew: '#0E7490',
    statusProgress: '#B26A00',
    statusResolved: '#2E7D5B',
    statusRejected: '#C0453B',

    gold: '#E0A400', // flower center (logo only)
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Rubik — rounded grotesk with full Cyrillic + Romanian diacritics. Weights are
 * distinct font families (not `fontWeight`), loaded in the root layout.
 */
export const Fonts = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
  // Monospace — IBM Plex Mono, for registry numbers + dates (civic-registry feel).
  mono: 'IBMPlexMono_500Medium',
};

/**
 * Type scale — deliberate role steps (size + weight + tracking + leading) so
 * hierarchy is unmistakable, not size-alone. Rubik weights are distinct families.
 */
export const Type = {
  display: { fontFamily: 'Rubik_700Bold', fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  headline: { fontFamily: 'Rubik_700Bold', fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  title: { fontFamily: 'Rubik_600SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  cardTitle: { fontFamily: 'Rubik_600SemiBold', fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: 'Rubik_400Regular', fontSize: 15, lineHeight: 22 },
  label: { fontFamily: 'Rubik_500Medium', fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  caption: { fontFamily: 'Rubik_500Medium', fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: 'Rubik_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Enamel-plaque corner language. */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
