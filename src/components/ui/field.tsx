import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// react-native-web draws the browser's default focus outline on the <input> itself
// (text area only). We indicate focus via the wrapper's brand ring, so kill this.
const noWebOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

type Props = TextInputProps & {
  label?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Renders a password show/hide toggle. */
  secure?: boolean;
};

/** Enamel input: soft water-wash fill, leading icon, focus ring, optional eye. */
export function Field({ label, icon, secure, style, onFocus, onBlur, ...input }: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View style={styles.group}>
      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
      <View
        style={[
          styles.wrap,
          { backgroundColor: c.brandWash, borderColor: focused ? c.brand : 'transparent' },
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? c.brand : c.textSecondary} /> : null}
        <TextInput
          {...input}
          secureTextEntry={secure && !show}
          underlineColorAndroid="transparent"
          placeholderTextColor={c.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: c.text }, noWebOutline, style]}
        />
        {secure ? (
          <Pressable onPress={() => setShow((v) => !v)} hitSlop={10}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={c.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.one },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 50,
  },
  input: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, height: '100%' },
});
