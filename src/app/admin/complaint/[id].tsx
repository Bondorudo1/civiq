import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminUpdateComplaint, useComplaint } from '@/api/hooks';
import type { ComplaintStatus } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Plaque } from '@/components/ui/plaque';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { COMPLAINT_CATEGORY, COMPLAINT_STATUS } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, responseWindow } from '@/lib/date';
import { shortRef } from '@/lib/id';

const STATUSES: ComplaintStatus[] = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

/** Closing a complaint owes the citizen an explanation — the API enforces it, so do we. */
const NEEDS_RESPONSE: ComplaintStatus[] = ['RESOLVED', 'REJECTED'];

export default function AdminComplaintScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cm, isLoading } = useComplaint(id);
  const update = useAdminUpdateComplaint();

  const [status, setStatus] = useState<ComplaintStatus | null>(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !cm) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
          <View style={styles.bar}>
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
              <Ionicons name="arrow-back" size={24} color={c.onBrand} />
            </Pressable>
            <Text style={[styles.barTitle, { color: c.onBrand }]}>Sesizare</Text>
          </View>
        </SafeAreaView>
        {isLoading ? <LoadingView /> : <EmptyState icon="alert-circle-outline" title="Sesizare negăsită" />}
      </View>
    );
  }

  const next = status ?? cm.status;
  const changing = next !== cm.status;
  const mustExplain = changing && NEEDS_RESPONSE.includes(next);
  const text = response.trim();
  const canSave =
    (changing || text.length > 0) && (!mustExplain || (text.length >= 4 && text.length <= 2000));

  const cat = COMPLAINT_CATEGORY[cm.category];
  const open = cm.status === 'NEW' || cm.status === 'IN_PROGRESS';
  const w = open ? responseWindow(cm.createdAt) : null;

  const save = () => {
    setError(null);
    update.mutate(
      { id: cm.id, status: changing ? next : undefined, adminResponse: text || undefined },
      {
        onSuccess: () => router.back(),
        onError: (e: unknown) => {
          const msg = (e as { message?: string })?.message;
          setError(msg ?? 'Nu am putut salva. Încearcă din nou.');
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Sesizare</Text>
          <Text style={styles.barRef}>{shortRef(cm.id)}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Plaque style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={[styles.cat, { color: c.textSecondary }]}>{cat.label}</Text>
            <StatusPill status={cm.status} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>{cm.title}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{cm.description}</Text>
          {cm.address ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={c.brand} />
              <Text style={[styles.meta, { color: c.textSecondary }]}>{cm.address}</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={c.brand} />
            <Text style={[styles.meta, { color: c.textSecondary }]}>
              {cm.author.fullName} · {formatDate(cm.createdAt)}
            </Text>
          </View>
          {w ? (
            <Text style={[styles.window, { color: w.remaining <= 0 ? c.accentPressed : c.amber }]}>
              {w.remaining <= 0
                ? `Termen depășit cu ${Math.abs(w.remaining)} zile`
                : `${w.remaining} din ${w.total} zile rămase`}
            </Text>
          ) : null}
          {cm.photoUrl ? <Image source={{ uri: cm.photoUrl }} style={styles.photo} contentFit="cover" /> : null}
        </Plaque>

        {cm.adminResponse ? (
          <Plaque borderColor={c.green} style={styles.card}>
            <Text style={[styles.sectionLabel, { color: c.green }]}>RĂSPUNSUL CURENT</Text>
            <Text style={[styles.body, { color: c.text }]}>{cm.adminResponse}</Text>
          </Plaque>
        ) : null}

        <Text style={[styles.label, { color: c.textSecondary }]}>Status</Text>
        <View style={styles.statuses}>
          {STATUSES.map((s) => {
            const active = next === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.status, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.brand : c.text }}>
                  {COMPLAINT_STATUS[s].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: c.textSecondary }]}>
          Răspuns către cetățean {mustExplain ? '· obligatoriu' : '· opțional'}
        </Text>
        <TextInput
          value={response}
          onChangeText={setResponse}
          placeholder={mustExplain ? 'Explică decizia — textul ajunge la cetățean.' : 'Adaugă un răspuns (opțional)…'}
          placeholderTextColor={c.textSecondary}
          underlineColorAndroid="transparent"
          maxLength={2000}
          multiline
          style={[
            styles.textarea,
            { backgroundColor: c.brandWash, color: c.text },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />

        {changing ? (
          <View style={[styles.notice, { backgroundColor: c.brandWash, borderColor: c.brand }]}>
            <Ionicons name="notifications-outline" size={16} color={c.brand} />
            <Text style={[styles.noticeText, { color: c.brand }]}>
              Schimbarea statusului trimite o notificare autorului sesizării.
            </Text>
          </View>
        ) : null}

        {mustExplain && text.length > 0 && text.length < 4 ? (
          <Text style={[styles.hint, { color: c.accentPressed }]}>Explicația trebuie să aibă minim 4 caractere.</Text>
        ) : null}
        {error ? <Text style={[styles.hint, { color: c.accentPressed }]}>{error}</Text> : null}

        <Button
          title={update.isPending ? 'Se salvează…' : 'Salvează'}
          icon="checkmark"
          onPress={save}
          disabled={!canSave || update.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2, flex: 1 },
  barRef: { fontFamily: Fonts.mono, fontSize: 12, color: '#9FD3DF' },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  card: { gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cat: { fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontFamily: Fonts.regular, fontSize: 12.5 },
  window: { fontFamily: Fonts.semibold, fontSize: 12, marginTop: 2 },
  photo: { width: '100%', height: 170, borderRadius: Radius.md, marginTop: Spacing.two },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  status: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  textarea: {
    minHeight: 110,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  noticeText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  hint: { fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
});
