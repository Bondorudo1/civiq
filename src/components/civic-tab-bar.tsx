import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Structural subset of expo-router's BottomTabBarProps (which it doesn't export).
type CivicTabBarProps = {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { emit: (...args: any[]) => any; navigate: (...args: any[]) => void };
};

// Filled name for the active (raised) token; `-outline` is appended when inactive.
const ICONS: Record<string, IoniconName> = {
  index: 'home',
  proiecte: 'document-text',
  contact: 'alert-circle',
  profil: 'person',
};

/** Bottom nav — variant 7: the active tab lifts into a filled teal token, label always shown. */
export function CivicTabBar({ state, descriptors, navigation }: CivicTabBarProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const base = ICONS[route.name] ?? 'ellipse';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}>
            {focused ? (
              <View style={[styles.token, { backgroundColor: c.brand, shadowColor: c.brand }]}>
                <Ionicons name={base} size={22} color={c.onBrand} />
              </View>
            ) : (
              <Ionicons name={`${base}-outline` as IoniconName} size={23} color={c.textSecondary} style={styles.inactiveIcon} />
            )}
            <Text style={[styles.label, focused ? styles.labelActive : null, { color: focused ? c.brand : c.textSecondary }]}>
              {label}
            </Text>
          </Pressable>
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
  inactiveIcon: { marginBottom: 1 },
  token: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -14 }],
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  label: { fontFamily: Fonts.medium, fontSize: 10.5 },
  labelActive: { fontFamily: Fonts.semibold, marginTop: -10 },
});
