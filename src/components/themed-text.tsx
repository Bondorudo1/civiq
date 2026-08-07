import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

// Rubik weights are distinct font families (not fontWeight); each variant sets its own.
const styles = StyleSheet.create({
  default: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  smallBold: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18 },
  title: { fontFamily: Fonts.semibold, fontSize: 28, lineHeight: 34 },
  subtitle: { fontFamily: Fonts.semibold, fontSize: 20, lineHeight: 26 },
  link: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 22 },
  linkPrimary: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 22, color: '#0E7490' },
  code: { fontFamily: Fonts.mono, fontSize: 12, lineHeight: 18 },
});
