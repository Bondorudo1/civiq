import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useAdminClosePost,
  useAdminDeletePost,
  useAdminReopenPost,
  useAdminUpdatePost,
  usePost,
} from '@/api/hooks';
import type { PostType } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/date';

const TYPES = Object.keys(POST_TYPE) as PostType[];

export default function AdminEditPostScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading } = usePost(id);

  const update = useAdminUpdatePost();
  const close = useAdminClosePost();
  const reopen = useAdminReopenPost();
  const remove = useAdminDeletePost();

  // null = untouched, so we only send fields the operator actually edited.
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [type, setType] = useState<PostType | null>(null);
  const [verdict, setVerdict] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
          <View style={styles.bar}>
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
              <Ionicons name="arrow-back" size={24} color={c.onBrand} />
            </Pressable>
            <Text style={[styles.barTitle, { color: c.onBrand }]}>Proiect</Text>
          </View>
        </SafeAreaView>
        {isLoading ? <LoadingView /> : <EmptyState icon="alert-circle-outline" title="Proiect negăsit" />}
      </View>
    );
  }

  const closed = post.status === 'CLOSED';
  const nextTitle = title ?? post.title;
  const nextBody = body ?? post.body;
  const nextType = type ?? post.type;
  const dirty = nextTitle !== post.title || nextBody !== post.body || nextType !== post.type;
  const canSave = dirty && nextTitle.trim().length >= 3 && nextBody.trim().length >= 1;

  const fail = (e: unknown, fallback: string) =>
    setError((e as { message?: string })?.message ?? fallback);

  const save = () => {
    setError(null);
    update.mutate(
      { id: post.id, title: nextTitle.trim(), body: nextBody.trim(), type: nextType },
      { onSuccess: () => router.back(), onError: (e) => fail(e, 'Nu am putut salva.') },
    );
  };

  const doClose = () => {
    setError(null);
    close.mutate(
      { id: post.id, verdict },
      { onSuccess: () => setVerdict(''), onError: (e) => fail(e, 'Nu am putut închide proiectul.') },
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Ștergi proiectul?',
      'Se șterg și toate comentariile, răspunsurile și reacțiile. Acțiunea nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () =>
            remove.mutate(post.id, {
              onSuccess: () => router.back(),
              onError: (e) => fail(e, 'Nu am putut șterge proiectul.'),
            }),
        },
      ],
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
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Editează proiectul</Text>
          <Text style={styles.barState}>{closed ? 'ÎNCHIS' : 'DESCHIS'}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.stats, { color: c.textSecondary }]}>
          {post.likesCount} susțin · {post.dislikesCount} împotrivă · {post.commentsCount} comentarii
        </Text>

        <Text style={[styles.label, { color: c.textSecondary }]}>Tip</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => {
            const meta = POST_TYPE[t];
            const active = nextType === t;
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Ionicons name={meta.icon} size={15} color={active ? c.brand : c.textSecondary} />
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.brand : c.text }}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Titlu" icon="pricetag-outline" value={nextTitle} onChangeText={setTitle} maxLength={200} />

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Conținut</Text>
          <TextInput
            value={nextBody}
            onChangeText={setBody}
            placeholderTextColor={c.textSecondary}
            underlineColorAndroid="transparent"
            maxLength={20000}
            multiline
            style={[
              styles.textarea,
              { backgroundColor: c.brandWash, color: c.text },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            ]}
          />
          {/* Editing a post drops its cached AI translations — the backend recomputes them. */}
          <Text style={[styles.note, { color: c.muted }]}>
            Modificarea textului resetează traducerile salvate.
          </Text>
        </View>

        <Button
          title={update.isPending ? 'Se salvează…' : 'Salvează modificările'}
          icon="checkmark"
          onPress={save}
          disabled={!canSave || update.isPending}
        />

        {/* Lifecycle. A consultation can't be closed without telling people what was decided. */}
        {closed ? (
          <Plaque borderColor={c.green} style={styles.card}>
            <Text style={[styles.sectionLabel, { color: c.green }]}>VERDICT PUBLICAT</Text>
            <Text style={[styles.body, { color: c.text }]}>{post.verdict}</Text>
            {post.closedAt ? (
              <Text style={[styles.note, { color: c.muted }]}>Închis pe {formatDate(post.closedAt)}</Text>
            ) : null}
            <Text style={[styles.note, { color: c.textSecondary }]}>
              Redeschiderea șterge verdictul — istoricul nu se păstrează.
            </Text>
            <Button
              title={reopen.isPending ? 'Se redeschide…' : 'Redeschide consultarea'}
              variant="secondary"
              icon="lock-open-outline"
              onPress={() => reopen.mutate(post.id, { onError: (e) => fail(e, 'Nu am putut redeschide.') })}
              disabled={reopen.isPending}
            />
          </Plaque>
        ) : (
          <Plaque style={styles.card}>
            <Text style={[styles.sectionLabel, { color: c.brand }]}>ÎNCHIDE CONSULTAREA</Text>
            <Text style={[styles.note, { color: c.textSecondary }]}>
              Verdictul este obligatoriu și rămâne vizibil pe pagina proiectului.
            </Text>
            <TextInput
              value={verdict}
              onChangeText={setVerdict}
              placeholder="Ce s-a decis în urma consultării?"
              placeholderTextColor={c.textSecondary}
              underlineColorAndroid="transparent"
              maxLength={5000}
              multiline
              style={[
                styles.verdictInput,
                { backgroundColor: c.brandWash, color: c.text },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
              ]}
            />
            <Button
              title={close.isPending ? 'Se închide…' : 'Închide cu verdict'}
              icon="lock-closed-outline"
              onPress={doClose}
              disabled={verdict.trim().length < 10 || close.isPending}
            />
            {verdict.trim().length > 0 && verdict.trim().length < 10 ? (
              <Text style={[styles.note, { color: c.accentPressed }]}>Minim 10 caractere.</Text>
            ) : null}
          </Plaque>
        )}

        {error ? <Text style={[styles.error, { color: c.accentPressed }]}>{error}</Text> : null}

        <Pressable onPress={confirmDelete} disabled={remove.isPending} style={styles.delete} accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={c.accentPressed} />
          <Text style={[styles.deleteText, { color: c.accentPressed }]}>Șterge proiectul</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2, flex: 1 },
  barState: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9, color: '#9FD3DF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  stats: { fontFamily: Fonts.medium, fontSize: 12.5 },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  group: { gap: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  textarea: {
    minHeight: 150,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  verdictInput: {
    minHeight: 100,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 14.5,
    textAlignVertical: 'top',
  },
  card: { gap: Spacing.two, marginTop: Spacing.two },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  note: { fontFamily: Fonts.medium, fontSize: 11.5, lineHeight: 16 },
  error: { fontFamily: Fonts.medium, fontSize: 12.5, textAlign: 'center' },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.three },
  deleteText: { fontFamily: Fonts.semibold, fontSize: 13.5 },
});
