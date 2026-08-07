import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Structural subset of expo-router's BottomTabBarProps (which it doesn't export).
type CivicTabBarProps = {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { emit: (...args: any[]) => any; navigate: (...args: any[]) => void };
  /** Route name → filled icon. Defaults to the citizen shell's set. */
  icons?: Record<string, IoniconName>;
};

// Filled name for the active (raised) token; `-outline` is appended when inactive.
const ICONS: Record<string, IoniconName> = {
  index: 'home',
  proiecte: 'document-text',
  contact: 'alert-circle',
  profil: 'person',
};

// The token rises on a spring (it has weight); colour crossfades on a timing curve
// (colour has no momentum). Reanimated honours system reduce-motion by default.
const LIFT = { damping: 15, stiffness: 190, mass: 0.6 } as const;
const FADE = { duration: 170 } as const;

function TabItem({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  focused: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  const lift = useDerivedValue(() => withSpring(focused ? 1 : 0, LIFT));
  const fade = useDerivedValue(() => withTiming(focused ? 1 : 0, FADE));

  // Inactive rests low (tight to its label); active lifts clear of the bar.
  const slot = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(lift.value, [0, 1], [10, -14]) }],
  }));
  const token = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ scale: interpolate(lift.value, [0, 1], [0.4, 1]) }],
    elevation: 6 * lift.value,
  }));
  const activeIcon = useAnimatedStyle(() => ({ opacity: fade.value }));
  const inactiveIcon = useAnimatedStyle(() => ({ opacity: 1 - fade.value }));
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(lift.value, [0, 1], [0, -10]) }],
    color: interpolateColor(fade.value, [0, 1], [c.textSecondary, c.brand]),
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}>
      <Animated.View style={[styles.slot, slot]}>
        <Animated.View
          style={[styles.token, { backgroundColor: c.brand, shadowColor: c.brand }, token]}
        />
        <Animated.View style={[styles.iconLayer, activeIcon]}>
          <Ionicons name={icon} size={22} color={c.onBrand} />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, inactiveIcon]}>
          <Ionicons name={`${icon}-outline` as IoniconName} size={23} color={c.textSecondary} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.label, focused ? styles.labelActive : null, labelStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

/** Bottom nav — variant 7: the active tab lifts into a filled teal token, label always shown. */
export function CivicTabBar({ state, descriptors, navigation, icons = ICONS }: CivicTabBarProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 8 },
      ]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];

        return (
          <TabItem
            key={route.key}
            label={(options.title ?? route.name) as string}
            icon={icons[route.name] ?? 'ellipse'}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  slot: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  token: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 23,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: Fonts.medium, fontSize: 10.5 },
  labelActive: { fontFamily: Fonts.semibold },
});
