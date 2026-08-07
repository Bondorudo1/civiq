import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type Props = {
  label: string;
  bg: string;
  fg: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

/** Enamel category tag (colored fill + matching text). */
export function Tag({ label, bg, fg, icon }: Props) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 0.4 },
});
