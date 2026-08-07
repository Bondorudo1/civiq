import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';

/**
 * The primărie bar. Deliberately a deeper teal than the citizen header, with a
 * standing PRIMĂRIE plate: acting here publishes to the whole city, and the
 * operator should never be in doubt about which app they are in.
 */
export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useTheme();
  const t = useT(adminTabsText);
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.title, { color: c.onBrand }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.plate}>
          <Text style={styles.plateText}>{t.plate}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    minHeight: 64,
  },
  left: { flex: 1 },
  title: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.medium, fontSize: 12, color: '#9FD3DF', marginTop: 1 },
  plate: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  plateText: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 1, color: '#FFFFFF' },
});
