import { StyleSheet, Text, View } from 'react-native';

import type { ComplaintStatus } from '@/api/types';
import { COMPLAINT_STATUS } from '@/constants/civic';
import { Fonts } from '@/constants/theme';

/** Enamel status stamp for a complaint. */
export function StatusPill({ status }: { status: ComplaintStatus }) {
  const meta = COMPLAINT_STATUS[status];
  return (
    <View style={[styles.pill, { backgroundColor: meta.bg }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: Fonts.semibold, fontSize: 11.5 },
});
