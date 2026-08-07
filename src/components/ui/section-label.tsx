import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Tracked signage label + hairline rule (+ optional trailing action). */
export function SectionLabel({ children, action }: { children: string; action?: ReactNode }) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.cap, { color: c.textSecondary }]}>{children}</Text>
      <View style={[styles.rule, { backgroundColor: c.line }]} />
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cap: { fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase' },
  rule: { flex: 1, height: 1 },
});
