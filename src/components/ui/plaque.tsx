import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = ViewProps & {
  onPress?: () => void;
  /** Self-colored enamel edge; defaults to the hairline line color. */
  borderColor?: string;
  padded?: boolean;
};

/** The enamel plaque — the app's base surface (rounded, hairline edge). */
export function Plaque({ children, onPress, borderColor, padded = true, style, ...rest }: Props) {
  const c = useTheme();
  const content = (
    <View
      style={[
        styles.base,
        { backgroundColor: c.surface, borderColor: borderColor ?? c.line },
        padded && styles.padded,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.lg, borderWidth: 1 },
  padded: { padding: Spacing.three },
});
