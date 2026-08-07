import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminDeleteNotification, useAdminNotifications, useAdminUpdateNotification } from '@/api/hooks';
import type { ParsedPayload } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { WORK_TYPE } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminDetailText } from '@/i18n/adminDetail';
import { confirmAction } from '@/lib/confirm';
import { formatDate } from '@/lib/date';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function AdminEditNotificationScreen() {
  const c = useTheme();
  const t = useT(adminDetailText);
  const loc = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useAdminNotifications();
  const update = useAdminUpdateNotification();
  const remove = useAdminDeleteNotification();

  const item = (data ?? []).find((n) => n.id === id);

  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bar = (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t.back}>
          <Ionicons name="arrow-back" size={24} color={c.onBrand} />
        </Pressable>
        <Text style={[styles.barTitle, { color: c.onBrand }]}>{t.notificationBar}</Text>
      </View>
    </SafeAreaView>
  );

  if (isLoading || !item) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        {bar}
        {isLoading ? <LoadingView /> : <EmptyState icon="alert-circle-outline" title={t.notificationNotFound} />}
      </View>
    );
  }

  // PARSED comes from the Premier Energy scraper: not editable (409), but deletable
  // so a bad parse can be pulled down.
  const parsed = item.kind === 'PARSED';
  const payload = parsed ? (item.payload as ParsedPayload | null) : null;

  const nextTitle = title ?? item.title ?? '';
  const nextBody = body ?? item.body ?? '';
  const nextDate = eventDate ?? item.eventDate ?? '';
  const dateValid = nextDate.length === 0 || ISO_DATE.test(nextDate);
  const dirty = nextTitle !== (item.title ?? '') || nextBody !== (item.body ?? '') || nextDate !== (item.eventDate ?? '');
  const canSave = dirty && dateValid && nextTitle.trim().length >= 3 && nextBody.trim().length >= 1;

  const fail = (e: unknown, fallback: string) =>
    setError((e as { message?: string })?.message ?? fallback);

  const confirmDelete = () => {
    confirmAction({
      title: t.deleteNotificationTitle,
      message: t.deleteNotificationBody,
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      destructive: true,
      onConfirm: () =>
        remove.mutate(item.id, {
          onSuccess: () => router.back(),
          onError: (e) => fail(e, t.deleteNotificationFailed),
        }),
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {bar}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {parsed ? (
          <>
            <View style={[styles.notice, { backgroundColor: '#FBEFD9', borderColor: '#E0B457' }]}>
              <Ionicons name="flash-outline" size={16} color="#8A5300" />
              <Text style={[styles.noticeText, { color: '#8A5300' }]}>{t.parsedNotice}</Text>
            </View>
            <Plaque style={styles.card}>
              <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
                {payload ? WORK_TYPE[payload.workType][loc].toUpperCase() : t.outageFallback}
              </Text>
              {payload?.segments.map((s, i) => (
                <View key={i} style={styles.segment}>
                  <Text style={[styles.streets, { color: c.text }]}>{s.streets}</Text>
                  <Text style={[styles.times, { color: c.textSecondary }]}>
                    {s.timeStart}–{s.timeEnd} · {s.reason}
                  </Text>
                </View>
              ))}
              <Text style={[styles.note, { color: c.muted }]}>
                {formatDate(item.eventDate ?? item.createdAt, loc)}
              </Text>
            </Plaque>
          </>
        ) : (
          <>
            <Field label={t.fieldTitle} icon="pricetag-outline" value={nextTitle} onChangeText={setTitle} maxLength={200} />

            <View style={styles.group}>
              <Text style={[styles.label, { color: c.textSecondary }]}>{t.fieldBody}</Text>
              <TextInput
                value={nextBody}
                onChangeText={setBody}
                placeholderTextColor={c.textSecondary}
                underlineColorAndroid="transparent"
                maxLength={5000}
                multiline
                style={[
                  styles.textarea,
                  { backgroundColor: c.brandWash, color: c.text },
                  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
                ]}
              />
            </View>

            <Field
              label={t.eventDate}
              icon="calendar-outline"
              placeholder="2026-08-15"
              value={nextDate}
              onChangeText={setEventDate}
              maxLength={10}
            />
            {!dateValid ? (
              <Text style={[styles.note, { color: c.accentPressed }]}>{t.dateFormat}</Text>
            ) : null}

            <Button
              title={update.isPending ? t.saving : t.saveChanges}
              icon="checkmark"
              onPress={() => {
                setError(null);
                update.mutate(
                  { id: item.id, title: nextTitle.trim(), body: nextBody.trim(), eventDate: nextDate.trim() || null },
                  { onSuccess: () => router.back(), onError: (e) => fail(e, t.saveFailed) },
                );
              }}
              disabled={!canSave || update.isPending}
            />
          </>
        )}

        {error ? <Text style={[styles.note, { color: c.accentPressed }]}>{error}</Text> : null}

        <Pressable onPress={confirmDelete} disabled={remove.isPending} style={styles.delete} accessibilityRole="button">
          <Ionicons name="trash-outline" size={16} color={c.accentPressed} />
          <Text style={[styles.deleteText, { color: c.accentPressed }]}>{t.deleteNotification}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  group: { gap: Spacing.one },
  textarea: {
    minHeight: 140,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  card: { gap: Spacing.two },
  sectionLabel: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  segment: { gap: 2 },
  streets: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19 },
  times: { fontFamily: Fonts.regular, fontSize: 12.5 },
  note: { fontFamily: Fonts.medium, fontSize: 11.5, lineHeight: 16 },
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
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: Spacing.three },
  deleteText: { fontFamily: Fonts.semibold, fontSize: 13.5 },
});
