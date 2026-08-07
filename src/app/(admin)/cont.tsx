import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMe } from '@/api/hooks';
import { AdminHeader } from '@/components/admin-header';
import { Button } from '@/components/ui/button';
import { Plaque } from '@/components/ui/plaque';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/store/auth';

export default function AdminAccountScreen() {
  const c = useTheme();
  const { data: me } = useMe();
  const signOut = useAuth((s) => s.signOut);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader title="Cont" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Plaque style={styles.card}>
          <Text style={[styles.label, { color: c.textSecondary }]}>OPERATOR</Text>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {me?.fullName ?? '—'}
          </Text>
          <Text style={[styles.email, { color: c.textSecondary }]} numberOfLines={1}>
            {me?.email ?? ''}
          </Text>
          <View style={[styles.plate, { backgroundColor: c.brandDeep }]}>
            <Text style={styles.plateText}>ROL: ADMIN</Text>
          </View>
        </Plaque>

        <Button title="Deconectare" variant="secondary" icon="log-out-outline" onPress={signOut} />

        <Text style={[styles.version, { color: c.muted }]}>CiviQ · Panou primărie · v1.0</Text>
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
  version: { fontFamily: Fonts.medium, fontSize: 12, textAlign: 'center', marginTop: Spacing.five },
});
