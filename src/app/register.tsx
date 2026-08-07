import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRegister } from '@/api/hooks';
import Logo from '@/assets/images/logo.svg';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { authText } from '@/i18n/auth';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/store/auth';

const TOTAL_STEPS = 4;

export default function RegisterScreen() {
  const c = useTheme();
  const signIn = useAuth((s) => s.signIn);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locale, setLocale] = useState<'ro' | 'ru'>('ro');
  const [error, setError] = useState<'EMAIL_TAKEN' | 'VALIDATION_ERROR' | 'FAILED' | null>(null);
  const register = useRegister();
  const t = authText[locale];

  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  // POST /auth/register always issues role CITIZEN; 409 EMAIL_TAKEN is the one
  // failure worth naming precisely, since the fix is to go back a step.
  // The cause is held, not the sentence, so step 2 can still change the language.
  const finish = () =>
    register.mutate(
      { email: email.trim().toLowerCase(), password, fullName: name.trim(), locale },
      {
        onSuccess: (res) => signIn(res.accessToken, res.user.role),
        onError: (e: unknown) => {
          const code = (e as { code?: string })?.code;
          setError(code === 'EMAIL_TAKEN' || code === 'VALIDATION_ERROR' ? code : 'FAILED');
          setStep(1);
        },
      },
    );

  const progress = (step + 1) / TOTAL_STEPS;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.bar}>
          <Pressable onPress={back} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.back}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
          <Text style={[styles.step, { color: c.textSecondary }]}>{t.stepOf(step + 1, TOTAL_STEPS)}</Text>
        </View>

        <View style={[styles.track, { backgroundColor: c.line }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: c.brand }]} />
        </View>

        <View style={styles.body}>
          {step < 3 ? (
            <View style={[styles.iconCircle, { borderColor: c.brand }]}>
              <Ionicons
                name={step === 0 ? 'person-outline' : step === 1 ? 'lock-closed-outline' : 'language-outline'}
                size={26}
                color={c.brand}
              />
            </View>
          ) : (
            <Logo width={64} height={64} />
          )}

          {step === 0 && (
            <>
              <Text style={[styles.title, { color: c.text }]}>{t.nameTitle}</Text>
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>{t.nameLabel}</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t.namePlaceholder}
                  placeholderTextColor={c.muted}
                  style={[styles.input, { borderColor: c.line, color: c.text, backgroundColor: c.surface }]}
                />
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={[styles.title, { color: c.text }]}>{t.credentialsTitle}</Text>
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>{t.emailLabel}</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor={c.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { borderColor: c.line, color: c.text, backgroundColor: c.surface }]}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.textSecondary }]}>{t.passwordLabel}</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={c.muted}
                  secureTextEntry
                  style={[styles.input, { borderColor: c.line, color: c.text, backgroundColor: c.surface }]}
                />
                <Text style={[styles.help, { color: c.textSecondary }]}>{t.passwordHelp}</Text>
              </View>
              {error ? (
                <View style={[styles.error, { backgroundColor: c.accentWash, borderColor: c.accent }]}>
                  <Ionicons name="alert-circle-outline" size={16} color={c.accentPressed} />
                  <Text style={[styles.errorText, { color: c.accentPressed }]}>
                    {error === 'EMAIL_TAKEN'
                      ? t.errEmailTaken
                      : error === 'VALIDATION_ERROR'
                        ? t.errValidation
                        : t.errRegisterFailed}
                  </Text>
                </View>
              ) : null}
            </>
          )}

          {step === 2 && (
            <>
              <Text style={[styles.title, { color: c.text }]}>{t.localeTitle}</Text>
              <View style={styles.localeRow}>
                {(['ro', 'ru'] as const).map((l) => {
                  const active = locale === l;
                  return (
                    <Pressable
                      key={l}
                      onPress={() => setLocale(l)}
                      style={[
                        styles.locale,
                        { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface },
                      ]}>
                      <Text
                        style={{
                          fontFamily: Fonts.semibold,
                          fontSize: 15,
                          color: active ? c.brand : c.text,
                        }}>
                        {l === 'ro' ? t.langRo : t.langRu}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={20} color={c.brand} />}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={[styles.title, styles.centerText, { color: c.text }]}>{t.doneTitle}</Text>
              <Text style={[styles.welcomeBody, { color: c.textSecondary }]}>{t.doneBody}</Text>
            </>
          )}
        </View>

        <View style={styles.footer}>
          {step < 3 ? (
            <Pressable onPress={next} style={styles.nextBtn} accessibilityRole="button">
              <Text style={[styles.nextText, { color: c.brand }]}>{t.next}</Text>
              <Ionicons name="arrow-forward" size={18} color={c.brand} />
            </Pressable>
          ) : (
            <Pressable
              onPress={finish}
              style={({ pressed }) => [styles.finishBtn, { backgroundColor: pressed ? c.brandDeep : c.brand }]}>
              <Text style={[styles.finishText, { color: c.onBrand }]}>{t.enterApp}</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  step: { fontFamily: Fonts.medium, fontSize: 13 },
  track: { height: 4, marginHorizontal: Spacing.four, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  body: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  title: { fontFamily: Fonts.semibold, fontSize: 24, lineHeight: 30 },
  centerText: { textAlign: 'center', marginTop: Spacing.three },
  field: { gap: Spacing.one },
  label: { fontFamily: Fonts.medium, fontSize: 13 },
  help: { fontFamily: Fonts.regular, fontSize: 11.5, marginTop: 4 },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  errorText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  localeRow: { gap: Spacing.two },
  locale: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  welcomeBody: { fontFamily: Fonts.regular, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  footer: { padding: Spacing.four },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  nextText: { fontFamily: Fonts.semibold, fontSize: 15 },
  finishBtn: { borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  finishText: { fontFamily: Fonts.semibold, fontSize: 15 },
});
