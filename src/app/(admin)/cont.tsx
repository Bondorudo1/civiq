import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMe, useUpdateMe } from '@/api/hooks';
import type { Locale } from '@/api/types';
import { AdminHeader } from '@/components/admin-header';
import { Button } from '@/components/ui/button';
import { Plaque } from '@/components/ui/plaque';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';
import { useAuth } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';

export default function AdminAccountScreen() {
  const c = useTheme();
  const t = useT(adminTabsText);
  const { data: me } = useMe();
  const signOut = useAuth((s) => s.signOut);
  const updateMe = useUpdateMe();

  const locale = useLocale();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const chooseLocale = (l: Locale) => {
    setLocale(l);
    updateMe.mutate({ locale: l });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader title={t.accountTitle} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Plaque style={styles.card}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t.operator}</Text>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {me?.fullName ?? '—'}
          </Text>
          <Text style={[styles.email, { color: c.textSecondary }]} numberOfLines={1}>
            {me?.email ?? ''}
          </Text>
          <View style={[styles.plate, { backgroundColor: c.brandDeep }]}>
            <Text style={styles.plateText}>{t.role}</Text>
          </View>
        </Plaque>

        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>{t.language}</Text>
        <View style={styles.langRow}>
          {(['ro', 'ru'] as const).map((l) => {
            const active = locale === l;
            return (
              <Pressable
                key={l}
                onPress={() => chooseLocale(l)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.lang, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: active ? c.brand : c.text }}>
                  {l === 'ro' ? 'Română' : 'Русский'}
                </Text>
                {active ? <Ionicons name="checkmark-circle" size={20} color={c.brand} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Button title={t.signOut} variant="secondary" icon="log-out-outline" onPress={signOut} />

        <Text style={[styles.version, { color: c.muted }]}>{t.version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  card: { gap: 3 },
  label: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  name: { fontFamily: Fonts.semibold, fontSize: 17, marginTop: 3 },
  email: { fontFamily: Fonts.regular, fontSize: 13.5 },
  plate: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginTop: Spacing.two },
  plateText: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 1, color: '#FFFFFF' },
  sectionLabel: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  langRow: { gap: Spacing.two },
  lang: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  version: { fontFamily: Fonts.medium, fontSize: 12, textAlign: 'center', marginTop: Spacing.five },
});
