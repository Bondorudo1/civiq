import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUnreadCount } from '@/api/hooks';
import Logo from '@/assets/images/logo.svg';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Enamel-civic top app bar: teal region (the "painted sign"), title on the left,
 * a notifications bell with a coral unread dot on the right.
 */
export function AppHeader({ title, showLogo, onBell }: { title: string; showLogo?: boolean; onBell?: () => void }) {
  const c = useTheme();
  const unread = useUnreadCount().data ?? 0;
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showLogo && (
            <View style={styles.mark}>
              <Logo width={30} height={30} />
            </View>
          )}
          <Text style={[styles.title, { color: c.onBrand }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={onBell}
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Notificări, ${unread} necitite` : 'Notificări'}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={c.onBrand} />
            {unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: c.accent, borderColor: c.brand }]}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : String(unread)}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    minHeight: 64,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.3 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 10, color: '#FFFFFF' },
});
