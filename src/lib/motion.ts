import { Platform } from 'react-native';

/**
 * Reanimated entering/exiting animations are unreliable on react-native-web: they
 * frequently strand the node at its initial keyframe (opacity 0 / off-screen), so
 * cards and list rows never become visible. Native runs the animation; web skips
 * it and renders the content immediately.
 *
 * Wrap every `entering={…}` value: `entering={enter(FadeInDown.duration(300))}`.
 */
export function enter<T>(animation: T): T | undefined {
  return Platform.OS === 'web' ? undefined : animation;
}
