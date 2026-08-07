import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useVerification } from '@/hooks/use-verification';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { type GateAction, sharedText } from '@/i18n/shared';

export type { GateAction };

/**
 * Shown in place of a gated action. The affordance stays visible and explains
 * itself — a hidden control reads as a broken app, an explained one teaches the
 * rule and offers the way through.
 *
 * `action` names the gated deed ('comment' | 'participate' | 'complain'), not the
 * word for it: the sentences below need a verb in the reader's language.
 */
export function VerifyGate({ action, compact }: { action: GateAction; compact?: boolean }) {
  const c = useTheme();
  const router = useRouter();
  const t = useT(sharedText);
  const { isPending, isRejected } = useVerification();

  const waiting = isPending;
  const tone = waiting ? c.amber : isRejected ? c.accentPressed : c.brand;
  const wash = waiting ? '#FBF3E2' : isRejected ? c.accentWash : c.brandWash;

  const message = waiting
    ? t.gatePendingBody(action)
    : isRejected
      ? t.gateRejectedBody(action)
      : t.gateBody(action);

  return (
    <View style={[compact ? styles.compact : styles.card, { backgroundColor: wash, borderColor: tone }]}>
      <View style={styles.head}>
        <Ionicons
          name={waiting ? 'hourglass-outline' : isRejected ? 'alert-circle-outline' : 'shield-checkmark-outline'}
          size={compact ? 16 : 20}
          color={tone}
        />
        <Text style={[compact ? styles.compactText : styles.title, { color: tone }]}>
          {waiting ? t.gatePendingTitle : isRejected ? t.gateRejectedTitle : t.gateTitle}
        </Text>
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>{message}</Text>
      {!waiting ? (
        <Pressable
          onPress={() => router.push('/verify')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { backgroundColor: pressed ? c.brandDeep : c.brand }]}>
          <Text style={[styles.buttonText, { color: c.onBrand }]}>
            {isRejected ? t.gateResubmit : t.gateVerify}
          </Text>
          <Ionicons name="arrow-forward" size={15} color={c.onBrand} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.three, gap: 7 },
  compact: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 11, gap: 5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontFamily: Fonts.bold, fontSize: 14.5, letterSpacing: -0.2 },
  compactText: { fontFamily: Fonts.semibold, fontSize: 13 },
  body: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 18 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.md,
    paddingVertical: 11,
    marginTop: 2,
  },
  buttonText: { fontFamily: Fonts.semibold, fontSize: 14 },
});
