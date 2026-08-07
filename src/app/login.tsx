import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/assets/images/logo.svg';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/store/auth';

const SCRIM = ['rgba(11,79,90,0.35)', 'rgba(11,79,90,0.45)', 'rgba(11,79,90,0.88)'] as const;

export default function LoginScreen() {
  const c = useTheme();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [locale, setLocale] = useState<'ro' | 'ru'>('ro');

  const submit = () => signIn('dev-token');

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.hero}>
        <Image
          source={require('@/assets/images/auth-hands.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient colors={SCRIM} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

        <SafeAreaView style={styles.heroInner} edges={['top']}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <View style={styles.mark}>
                <Logo width={26} height={26} />
              </View>
              <Text style={styles.brandText}>CiviQ</Text>
            </View>

            <View style={styles.langToggle}>
              {(['ro', 'ru'] as const).map((l) => {
                const active = locale === l;
                return (
                  <Pressable key={l} onPress={() => setLocale(l)} style={[styles.langSeg, active && styles.langSegActive]}>
                    <Text style={[styles.langText, { color: active ? c.brand : '#FFFFFF' }]}>
                      {l.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.welcomeWrap} pointerEvents="none">
            <Text style={styles.welcomeGhost}>Bine ai venit</Text>
            <View style={styles.underline} />
            <Text style={styles.welcomeSub}>Vocea ta pentru Cahul</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={[styles.card, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>Autentificare</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>Intră dacă ai deja un cont</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Email</Text>
          <View style={[styles.inputWrap, { backgroundColor: c.brandWash, borderColor: emailFocus ? c.brand : 'transparent' }]}>
            <Ionicons name="mail-outline" size={18} color={emailFocus ? c.brand : c.textSecondary} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              placeholder="nume@exemplu.md"
              placeholderTextColor={c.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: c.text }]}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Parolă</Text>
          <View style={[styles.inputWrap, { backgroundColor: c.brandWash, borderColor: pwFocus ? c.brand : 'transparent' }]}>
            <Ionicons name="lock-closed-outline" size={18} color={pwFocus ? c.brand : c.textSecondary} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              placeholder="••••••••"
              placeholderTextColor={c.textSecondary}
              secureTextEntry={!showPw}
              style={[styles.input, { color: c.text }]}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={10}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={c.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={submit}
          style={({ pressed }) => [styles.button, { backgroundColor: pressed ? c.brandDeep : c.brand }]}>
          <Text style={[styles.buttonText, { color: c.onBrand }]}>Intră în cont</Text>
          <Ionicons name="arrow-forward" size={18} color={c.onBrand} />
        </Pressable>

        <View style={styles.footer}>
          <Text style={{ color: c.textSecondary, fontFamily: Fonts.regular }}>Nu ai cont?</Text>
          <Link href="/register" style={{ color: c.brand, fontFamily: Fonts.semibold }}>
            Înregistrează-te
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: '58%' },
  heroInner: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.one },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  mark: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  brandText: { fontFamily: Fonts.bold, fontSize: 19, color: '#FFFFFF' },
  langToggle: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  langSeg: { paddingHorizontal: 12, paddingVertical: 5 },
  langSegActive: { backgroundColor: '#FFFFFF' },
  langText: { fontFamily: Fonts.semibold, fontSize: 12 },
  welcomeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: Spacing.six },
  welcomeGhost: {
    fontFamily: Fonts.bold,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.74)',
    textShadowColor: 'rgba(8,32,38,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  underline: { width: 64, height: 3, borderRadius: 2, backgroundColor: '#F2637A', marginTop: Spacing.three },
  welcomeSub: { fontFamily: Fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: Spacing.three },
  card: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#0B4F5A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  title: { fontFamily: Fonts.bold, fontSize: 24, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, marginTop: -Spacing.two },
  field: { gap: Spacing.one },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 50,
  },
  input: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, height: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingVertical: 15,
    marginTop: Spacing.two,
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: { fontFamily: Fonts.semibold, fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.one },
});
