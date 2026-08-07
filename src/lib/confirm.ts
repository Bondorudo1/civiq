import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation.
 *
 * `Alert.alert` is a no-op in react-native-web — the dialog never appears and the
 * confirm callback never runs, so any action gated behind it silently dies on web
 * (which is a demo target here). This routes web through `window.confirm` and keeps
 * the native Alert everywhere else, so a confirmed action fires on both.
 */
export function confirmAction(opts: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${opts.title}\n\n${opts.message}`)) {
      opts.onConfirm();
    }
    return;
  }
  Alert.alert(opts.title, opts.message, [
    { text: opts.cancelLabel, style: 'cancel' },
    { text: opts.confirmLabel, style: opts.destructive ? 'destructive' : 'default', onPress: opts.onConfirm },
  ]);
}
