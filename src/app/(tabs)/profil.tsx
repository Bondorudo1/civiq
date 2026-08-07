import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useMe, useUpdateMe } from '@/api/hooks';
import type { Locale } from '@/api/types';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Plaque } from '@/components/ui/plaque';
import { VerifyGate } from '@/components/verify-gate';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVerification } from '@/hooks/use-verification';
import { useAuth } from '@/store/auth';

function initials(name?: string): string {
  if (!name) return '·';
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfilScreen() {
  const c = useTheme();
  const router = useRouter();
  const { data: me } = useMe();
  const signOut = useAuth((s) => s.signOut);
  const updateMe = useUpdateMe();
  const { canParticipate } = useVerification();

  // PATCH /api/me takes either field on its own.
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const locale = me?.locale ?? 'ro';

  const startEdit = () => {
    setName(me?.fullName ?? '');
    setEditing(true);
  };
  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 120) return;
    updateMe.mutate({ fullName: trimmed }, { onSuccess: () => setEditing(false) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title="Profil" onBell={() => router.push('/notifications')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Plaque style={styles.card}>
          <View style={[styles.avatar, { backgroundColor: c.brandWash }]}>
            <Text style={[styles.avatarText, { color: c.brand }]}>{initials(me?.fullName)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
              {me?.fullName ?? '—'}
            </Text>
            <Text style={[styles.email, { color: c.textSecondary }]} numberOfLines={1}>
              {me?.email ?? ''}
            </Text>
          </View>
          {!editing ? (
            <Pressable onPress={startEdit} hitSlop={10} accessibilityRole="button" accessibilityLabel="Editează numele">
              <Ionicons name="create-outline" size={20} color={c.brand} />
            </Pressable>
          ) : null}
        </Plaque>

        {editing ? (
          <Plaque style={styles.edit}>
            <Field
              label="Nume complet"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              maxLength={120}
              placeholder="Numele tău"
            />
            <View style={styles.editBtns}>
              <View style={{ flex: 1 }}>
                <Button title="Anulează" variant="secondary" onPress={() => setEditing(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={updateMe.isPending ? 'Se salvează…' : 'Salvează'}
                  onPress={saveName}
                  disabled={name.trim().length < 2 || updateMe.isPending}
                />
              </View>
            </View>
          </Plaque>
        ) : null}

        <Text style={[styles.label, { color: c.textSecondary }]}>Statut</Text>
        {canParticipate ? (
          <Plaque borderColor={c.green} style={styles.statusCard}>
            <Ionicons name="shield-checkmark" size={20} color={c.green} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: c.green }]}>Locuitor verificat</Text>
              <Text style={[styles.statusBody, { color: c.textSecondary }]}>
                Poți comenta, reacționa și depune sesizări.
              </Text>
            </View>
          </Plaque>
        ) : (
          <VerifyGate action="participi" />
        )}

        <Text style={[styles.label, { color: c.textSecondary }]}>Limbă</Text>
        <View style={styles.langRow}>
          {(['ro', 'ru'] as const).map((l) => {
            const active = locale === l;
            return (
              <Pressable
                key={l}
                onPress={() => updateMe.mutate({ locale: l })}
                style={[styles.lang, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 14, color: active ? c.brand : c.text }}>
                  {l === 'ro' ? 'Română' : 'Русский'}
                </Text>
                {active ? <Ionicons name="checkmark-circle" size={20} color={c.brand} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: Spacing.four }}>
          <Button title="Deconectare" variant="secondary" icon="log-out-outline" onPress={signOut} />
        </View>

        <Text style={[styles.version, { color: c.muted }]}>CiviQ · Cahul · v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 18 },
  name: { fontFamily: Fonts.semibold, fontSize: 17 },
  email: { fontFamily: Fonts.regular, fontSize: 13.5, marginTop: 2 },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3, marginTop: Spacing.two },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  statusTitle: { fontFamily: Fonts.semibold, fontSize: 14.5 },
  statusBody: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 17, marginTop: 1 },
  edit: { gap: Spacing.three },
  editBtns: { flexDirection: 'row', gap: Spacing.two },
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
