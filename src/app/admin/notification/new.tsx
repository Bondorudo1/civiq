import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminCreateNotification } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** The backend takes a plain date; anything else is a 422. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function AdminNewNotificationScreen() {
  const c = useTheme();
  const create = useAdminCreateNotification();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dateValid = eventDate.length === 0 || ISO_DATE.test(eventDate);
  const canSubmit = title.trim().length >= 3 && body.trim().length >= 1 && dateValid;

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    create.mutate(
      { title: title.trim(), body: body.trim(), eventDate: eventDate.trim() || null },
      {
        onSuccess: () => router.back(),
        onError: () => setError('Nu am putut publica anunțul. Încearcă din nou.'),
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
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Anunț nou</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.notice, { backgroundColor: c.accentWash, borderColor: c.accent }]}>
          <Ionicons name="megaphone-outline" size={16} color={c.accentPressed} />
          <Text style={[styles.noticeText, { color: c.accentPressed }]}>
            Anunțul ajunge la toți locuitorii înregistrați, imediat după publicare.
          </Text>
        </View>

        <Field
          label="Titlu"
          icon="pricetag-outline"
          placeholder="Ex. Întrerupere apă în centru"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Conținut</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Ce trebuie să știe locuitorii: ce, unde, când, cât durează…"
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
          label="Data evenimentului (opțional)"
          icon="calendar-outline"
          placeholder="2026-08-15"
          value={eventDate}
          onChangeText={setEventDate}
          maxLength={10}
        />
        {/* Feed order keys off this: upcoming dates rise to the top. */}
        <Text style={[styles.hint, { color: dateValid ? c.textSecondary : c.accentPressed }]}>
          {dateValid
            ? 'Anunțurile cu dată viitoare apar primele în lista locuitorilor.'
            : 'Formatul trebuie să fie AAAA-LL-ZZ.'}
        </Text>

        {error ? <Text style={[styles.hint, { color: c.accentPressed }]}>{error}</Text> : null}

        <Button
          title={create.isPending ? 'Se publică…' : 'Publică anunțul'}
          icon="megaphone-outline"
          onPress={submit}
          disabled={!canSubmit || create.isPending}
        />
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
  hint: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
});
