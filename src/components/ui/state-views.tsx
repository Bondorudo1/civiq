import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { WaterTexture } from '@/components/water-texture';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function LoadingView({ label }: { label?: string }) {
  const c = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={c.brand} />
      {label ? <Text style={[styles.msg, { color: c.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IoniconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const c = useTheme();
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <View style={styles.iconRipple} pointerEvents="none">
          <WaterTexture width={150} height={110} color={c.brandBright} />
        </View>
        <Ionicons name={icon} size={40} color={c.brand} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? <Text style={[styles.msg, { color: c.textSecondary }]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  const c = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={44} color={c.line} />
      <Text style={[styles.title, { color: c.text }]}>Ceva n-a mers</Text>
      <Text style={[styles.msg, { color: c.textSecondary }]}>
        Nu am putut încărca datele. Verifică conexiunea și încearcă din nou.
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button title="Reîncearcă" variant="secondary" icon="refresh-outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  iconWrap: { width: 150, height: 110, alignItems: 'center', justifyContent: 'center' },
  iconRipple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  title: { fontFamily: Fonts.semibold, fontSize: 16, textAlign: 'center', marginTop: Spacing.one },
  msg: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: Spacing.three, alignSelf: 'stretch' },
});
