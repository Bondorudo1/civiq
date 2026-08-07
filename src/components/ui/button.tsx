import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  style?: ViewStyle;
};

/** Primary (filled teal) or secondary (outlined) enamel button. */
export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: Props) {
  const c = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        primary
          ? { backgroundColor: pressed ? c.brandDeep : c.brand, ...styles.shadow, shadowColor: c.brand }
          : { backgroundColor: pressed ? c.brandWash : c.surface, borderWidth: 1, borderColor: c.line },
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.row}>
        <Text style={[styles.text, { color: primary ? c.onBrand : c.brand }]}>{title}</Text>
        {icon ? <Ionicons name={icon} size={18} color={primary ? c.onBrand : c.brand} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  text: { fontFamily: Fonts.semibold, fontSize: 15 },
  shadow: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4 },
  disabled: { opacity: 0.45 },
});
