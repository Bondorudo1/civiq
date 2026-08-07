import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRequestVerification } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { WaterTexture } from '@/components/water-texture';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVerification } from '@/hooks/use-verification';

const REASONS = [
  { icon: 'person-outline', text: 'Un locuitor, o singură voce — nimeni nu votează de zece ori.' },
  { icon: 'location-outline', text: 'Sesizările ajung la echipa potrivită, pe adresa potrivită.' },
  { icon: 'lock-closed-outline', text: 'Datele merg doar la primărie și nu apar public.' },
] as const;

export default function VerifyScreen() {
  const c = useTheme();
  const request = useRequestVerification();
  const { isPending, isRejected } = useVerification();

  const [idnp, setIdnp] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const idnpOk = /^\d{13}$/.test(idnp);
  const canSubmit = idnpOk && address.trim().length >= 5 && !request.isPending;

  const submit = () =>
    request.mutate(
      { idnp, address: address.trim() },
      {
        onSuccess: () => setSent(true),
        onError: (e: unknown) => {
          const fields = (e as { fields?: Record<string, string> })?.fields;
          setError(fields?.idnp ?? 'Nu am putut trimite cererea. Încearcă din nou.');
        },
      },
    );

  const bar = (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
          <Ionicons name="arrow-back" size={24} color={c.onBrand} />
        </Pressable>
        <Text style={[styles.barTitle, { color: c.onBrand }]}>Verificare</Text>
      </View>
    </SafeAreaView>
  );

  // Submitted, but not yet approved — be honest that the wait is real.
  if (sent || isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        {bar}
        <View style={styles.done}>
          <View style={styles.motifWrap}>
            <View style={styles.motif} pointerEvents="none">
              <WaterTexture width={220} height={190} color="#22A5BD" />
            </View>
            <Animated.View entering={ZoomIn.duration(420)} style={[styles.badge, { backgroundColor: c.amber }]}>
              <Ionicons name="hourglass-outline" size={38} color="#FFFFFF" />
            </Animated.View>
          </View>
          <Text style={[styles.doneTitle, { color: c.text }]}>Cererea a fost trimisă</Text>
          <Text style={[styles.doneText, { color: c.textSecondary }]}>
            Primăria confirmă datele și îți deschide accesul. Vei primi o notificare cu decizia.
          </Text>
          <Text style={[styles.doneNote, { color: c.muted }]}>
            Până atunci poți citi proiectele și anunțurile, dar nu poți comenta sau depune sesizări.
          </Text>
          <View style={styles.doneBtns}>
            <Button title="Înapoi acasă" onPress={() => router.replace('/')} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {bar}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroMotif} pointerEvents="none">
            <WaterTexture width={200} height={140} color={c.brandBright} />
          </View>
          <Ionicons name="shield-checkmark-outline" size={30} color={c.brand} />
          <Text style={[styles.title, { color: c.text }]}>Confirmă că locuiești în Cahul</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Oricine poate citi ce se întâmplă în oraș. Ca să comentezi, să reacționezi sau să depui
            o sesizare, primăria trebuie să știe că ești locuitor.
          </Text>
        </View>

        {isRejected ? (
          <View style={[styles.rejected, { backgroundColor: c.accentWash, borderColor: c.accent }]}>
            <Ionicons name="alert-circle-outline" size={16} color={c.accentPressed} />
            <Text style={[styles.rejectedText, { color: c.accentPressed }]}>
              Cererea anterioară a fost respinsă. Verifică datele și trimite din nou.
            </Text>
          </View>
        ) : null}

        <View style={styles.reasons}>
          {REASONS.map((r) => (
            <View key={r.text} style={styles.reason}>
              <Ionicons name={r.icon} size={16} color={c.brand} />
              <Text style={[styles.reasonText, { color: c.textSecondary }]}>{r.text}</Text>
            </View>
          ))}
        </View>

        <Field
          label="IDNP"
          icon="card-outline"
          placeholder="13 cifre"
          value={idnp}
          onChangeText={(t) => setIdnp(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={13}
        />
        {idnp.length > 0 && !idnpOk ? (
          <Text style={[styles.hint, { color: c.accentPressed }]}>IDNP-ul are exact 13 cifre.</Text>
        ) : null}

        <Field
          label="Adresa de domiciliu"
          icon="home-outline"
          placeholder="str. Independenței 24, ap. 3"
          value={address}
          onChangeText={setAddress}
          maxLength={255}
        />

        {error ? <Text style={[styles.hint, { color: c.accentPressed }]}>{error}</Text> : null}

        <Button
          title={request.isPending ? 'Se trimite…' : 'Trimite cererea'}
          icon="shield-checkmark-outline"
          onPress={submit}
          disabled={!canSubmit}
        />
        <Text style={[styles.legal, { color: c.muted }]}>
          Datele sunt folosite doar pentru confirmarea domiciliului și nu sunt afișate public.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  hero: { alignItems: 'center', gap: 6, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  heroMotif: { position: 'absolute', top: -10, left: 0, right: 0, alignItems: 'center', opacity: 0.45 },
  title: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.3, textAlign: 'center' },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 19, textAlign: 'center' },
  reasons: { gap: 9 },
  reason: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reasonText: { flex: 1, fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 18 },
  hint: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  legal: { fontFamily: Fonts.regular, fontSize: 11.5, lineHeight: 16, textAlign: 'center' },
  rejected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  rejectedText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  motifWrap: { width: 200, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  motif: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B26A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  doneTitle: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.3, textAlign: 'center' },
  doneText: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: Spacing.two, maxWidth: 320 },
  doneNote: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: Spacing.two, maxWidth: 300 },
  doneBtns: { alignSelf: 'stretch', marginTop: Spacing.five },
});
