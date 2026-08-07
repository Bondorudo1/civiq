import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChatWithBot } from '@/api/hooks';
import type { ChatMessage } from '@/api/types';
import { WaterTexture } from '@/components/water-texture';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { assistantText } from '@/i18n/assistant';

const MAX = 1000;

/**
 * Reanimated's entering animations strand the node at `visibility: hidden` on web
 * when a message is appended while the scroller is animating to the bottom — the
 * bubble mounts with its text and never becomes visible. Native is unaffected, so
 * keep the animation there and let web render instantly.
 */
const enter = Platform.OS === 'web' ? undefined : FadeInDown.duration(260);

export default function AskScreen() {
  const c = useTheme();
  const t = useT(assistantText);
  const chat = useChatWithBot();
  const scroller = useRef<ScrollView>(null);
  const seq = useRef(0);
  const nextId = () => `m${++seq.current}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  const empty = messages.length === 0;

  const ask = (content: string, history: ChatMessage[]) => {
    chat.mutate(
      history.filter((m) => !m.failed).map((m) => ({ role: m.role, content: m.content })),
      {
        onSuccess: (reply) =>
          setMessages((m) => [
            ...m,
            { id: nextId(), role: 'assistant', content: reply.answer, links: reply.links },
          ]),
        // Keep the failure in the thread instead of a toast, so retry sits where
        // the answer would have been.
        onError: () =>
          setMessages((m) => [...m, { id: nextId(), role: 'assistant', content, failed: true }]),
      },
    );
  };

  const send = (text?: string) => {
    const content = (text ?? draft).trim();
    if (content.length < 3 || chat.isPending) return;
    const history: ChatMessage[] = [...messages, { id: nextId(), role: 'user', content }];
    setMessages(history);
    setDraft('');
    ask(content, history);
  };

  const retry = (failedId: string, question: string) => {
    const history = messages.filter((m) => m.id !== failedId);
    setMessages(history);
    ask(question, history);
  };

  const reset = () => {
    setMessages([]);
    setDraft('');
    chat.reset();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t.back}>
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <View style={styles.barTitleWrap}>
            <Text style={[styles.barTitle, { color: c.onBrand }]}>{t.barTitle}</Text>
            <Text style={styles.barSub}>{t.barSub}</Text>
          </View>
          {!empty ? (
            <Pressable onPress={reset} hitSlop={10} accessibilityRole="button" accessibilityLabel={t.newChat}>
              <Ionicons name="create-outline" size={22} color={c.onBrand} />
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView
        ref={scroller}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
        {empty ? (
          <View style={styles.intro}>
            <View style={styles.motif} pointerEvents="none">
              <WaterTexture width={210} height={150} color={c.brandBright} />
            </View>
            <Ionicons name="sparkles-outline" size={30} color={c.brand} />
            <Text style={[styles.introTitle, { color: c.text }]}>{t.introTitle}</Text>
            <Text style={[styles.introText, { color: c.textSecondary }]}>{t.introText}</Text>
          </View>
        ) : null}

        {empty
          ? t.suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => send(s)}
                style={[styles.suggestion, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Ionicons name="help-circle-outline" size={17} color={c.brand} />
                <Text style={[styles.suggestionText, { color: c.text }]}>{s}</Text>
                <Ionicons name="chevron-forward" size={15} color={c.muted} />
              </Pressable>
            ))
          : null}

        {messages.map((m) =>
          m.role === 'user' ? (
            <Animated.View key={m.id} entering={enter} style={styles.userRow}>
              <View style={[styles.userBubble, { backgroundColor: c.brand }]}>
                <Text style={[styles.userText, { color: c.onBrand }]}>{m.content}</Text>
              </View>
            </Animated.View>
          ) : m.failed ? (
            <Animated.View key={m.id} entering={enter} style={styles.botRow}>
              <View style={[styles.seal, { backgroundColor: c.accent }]}>
                <Ionicons name="alert" size={13} color="#FFFFFF" />
              </View>
              <View style={[styles.botBubble, { backgroundColor: c.accentWash, borderColor: c.accent }]}>
                <Text style={[styles.failText, { color: c.accentPressed }]}>{t.chatFailed}</Text>
                <Pressable onPress={() => retry(m.id, m.content)} hitSlop={8} style={styles.retry}>
                  <Ionicons name="refresh" size={14} color={c.accentPressed} />
                  <Text style={[styles.retryText, { color: c.accentPressed }]}>{t.retry}</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            <Animated.View key={m.id} entering={enter} style={styles.botRow}>
              <View style={[styles.seal, { backgroundColor: c.brand }]}>
                <Ionicons name="sparkles" size={13} color={c.onBrand} />
              </View>
              <View style={[styles.botBubble, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Text style={[styles.botText, { color: c.text }]}>{m.content}</Text>
                {m.links?.length ? (
                  <View style={styles.sources}>
                    {m.links.map((link) => (
                      <Pressable
                        key={link}
                        onPress={() =>
                          WebBrowser.openBrowserAsync(link, { toolbarColor: c.brand, controlsColor: '#FFFFFF' })
                        }
                        style={styles.source}>
                        <Ionicons name="link-outline" size={13} color={c.brand} />
                        <Text style={[styles.sourceText, { color: c.brand }]} numberOfLines={1}>
                          {link.replace(/^https?:\/\//, '')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </Animated.View>
          ),
        )}

        {chat.isPending ? (
          <View style={styles.botRow}>
            <View style={[styles.seal, { backgroundColor: c.brand }]}>
              <Ionicons name="sparkles" size={13} color={c.onBrand} />
            </View>
            <View style={[styles.botBubble, styles.typing, { backgroundColor: c.surface, borderColor: c.line }]}>
              <ActivityIndicator size="small" color={c.brand} />
              <Text style={[styles.typingText, { color: c.textSecondary }]}>{t.typing}</Text>
            </View>
          </View>
        ) : null}

        {!empty ? (
          <Text style={[styles.disclaimer, { color: c.muted }]}>{t.disclaimer}</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.composer, { backgroundColor: c.surface, borderTopColor: c.line }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={empty ? t.composerFirst : t.composerMore}
          placeholderTextColor={c.textSecondary}
          underlineColorAndroid="transparent"
          maxLength={MAX}
          multiline
          style={[
            styles.input,
            { backgroundColor: c.background, color: c.text },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
        <Pressable
          onPress={() => send()}
          disabled={draft.trim().length < 3 || chat.isPending}
          accessibilityRole="button"
          accessibilityLabel={t.sendQuestion}
          style={[
            styles.send,
            { backgroundColor: c.brand, opacity: draft.trim().length < 3 || chat.isPending ? 0.4 : 1 },
          ]}>
          <Ionicons name="arrow-up" size={19} color={c.onBrand} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 10 },
  barTitleWrap: { flex: 1 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 17, letterSpacing: -0.2 },
  barSub: { fontFamily: Fonts.regular, fontSize: 11.5, color: '#CFE9EF', marginTop: 1 },
  thread: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.four },
  intro: { alignItems: 'center', paddingTop: Spacing.four, paddingBottom: Spacing.three, gap: 6 },
  motif: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', opacity: 0.5 },
  introTitle: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.3 },
  introText: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 19, textAlign: 'center', maxWidth: 300 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 13,
  },
  suggestionText: { flex: 1, fontFamily: Fonts.medium, fontSize: 13.5, lineHeight: 18 },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '85%',
    borderRadius: Radius.lg,
    borderBottomRightRadius: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  userText: { fontFamily: Fonts.regular, fontSize: 14.5, lineHeight: 20 },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  seal: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  botBubble: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    borderTopLeftRadius: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    gap: 7,
  },
  botText: { fontFamily: Fonts.regular, fontSize: 14.5, lineHeight: 21 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 0, alignSelf: 'flex-start' },
  typingText: { fontFamily: Fonts.medium, fontSize: 13 },
  sources: { gap: 4, paddingTop: 2 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sourceText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12 },
  failText: { fontFamily: Fonts.medium, fontSize: 13.5, lineHeight: 19 },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  retryText: { fontFamily: Fonts.semibold, fontSize: 13 },
  disclaimer: { fontFamily: Fonts.regular, fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: Spacing.two },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, padding: Spacing.three, borderTopWidth: 1 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    fontFamily: Fonts.regular,
    fontSize: 14.5,
    textAlignVertical: 'top',
  },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
