import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
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

import { useAskCity } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Plaque } from '@/components/ui/plaque';
import { WaterTexture } from '@/components/water-texture';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Openers that show the assistant's range without the citizen having to guess. */
const SUGGESTIONS = [
  'Ce acte îmi trebuie pentru autorizația de construcție?',
  'Cum depun o cerere la ghișeul unic?',
  'În cât timp răspunde primăria la o sesizare?',
  'Unde plătesc impozitul pe bunuri imobiliare?',
];

const MAX = 1000;

export default function AskScreen() {
  const c = useTheme();
  const [question, setQuestion] = useState('');
  const ask = useAskCity();

  const answer = ask.data;
  // 503 AI_UNAVAILABLE is "try again", not a broken app — say so softly and keep the button live.
  const unavailable = ask.isError;

  const submit = (text?: string) => {
    const q = (text ?? question).trim();
    if (q.length < 3) return;
    setQuestion(q);
    ask.mutate(q);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Întreabă primăria</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {!answer && !ask.isPending ? (
          <View style={styles.intro}>
            <View style={styles.motif} pointerEvents="none">
              <WaterTexture width={210} height={150} color={c.brandBright} />
            </View>
            <Ionicons name="sparkles-outline" size={30} color={c.brand} />
            <Text style={[styles.introTitle, { color: c.text }]}>Ce vrei să afli?</Text>
            <Text style={[styles.introText, { color: c.textSecondary }]}>
              Răspundem din regulamentele și formularele primăriei Cahul, cu sursele la vedere.
            </Text>
          </View>
        ) : null}

        {!answer && !ask.isPending
          ? SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => submit(s)}
                style={[styles.suggestion, { backgroundColor: c.surface, borderColor: c.line }]}>
                <Ionicons name="help-circle-outline" size={17} color={c.brand} />
                <Text style={[styles.suggestionText, { color: c.text }]}>{s}</Text>
                <Ionicons name="chevron-forward" size={15} color={c.muted} />
              </Pressable>
            ))
          : null}

        {ask.isPending ? (
          <Plaque style={styles.pending}>
            <ActivityIndicator color={c.brand} />
            <Text style={[styles.pendingText, { color: c.textSecondary }]}>
              Caut în baza de cunoștințe a primăriei…
            </Text>
            <Text style={[styles.pendingHint, { color: c.muted }]}>Poate dura până la un minut.</Text>
          </Plaque>
        ) : null}

        {answer ? (
          <Animated.View entering={FadeInDown.duration(320)}>
            <Text style={[styles.asked, { color: c.textSecondary }]} numberOfLines={3}>
              {question}
            </Text>
            <Plaque borderColor={c.brand} style={styles.answer}>
              <View style={styles.answerHead}>
                <View style={[styles.seal, { backgroundColor: c.brand }]}>
                  <Ionicons name="sparkles" size={14} color={c.onBrand} />
                </View>
                <Text style={[styles.answerLabel, { color: c.brand }]}>RĂSPUNS ASISTAT DE AI</Text>
              </View>
              <Text style={[styles.answerText, { color: c.text }]}>{answer.explain}</Text>

              {answer.links.length ? (
                <View style={styles.sources}>
                  <Text style={[styles.sourcesLabel, { color: c.textSecondary }]}>SURSE</Text>
                  {answer.links.map((link) => (
                    <Pressable
                      key={link}
                      onPress={() => WebBrowser.openBrowserAsync(link, { toolbarColor: c.brand, controlsColor: '#FFFFFF' })}
                      style={styles.source}>
                      <Ionicons name="link-outline" size={14} color={c.brand} />
                      <Text style={[styles.sourceText, { color: c.brand }]} numberOfLines={1}>
                        {link.replace(/^https?:\/\//, '')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Plaque>
            <Text style={[styles.disclaimer, { color: c.muted }]}>
              Informativ. Pentru situații specifice, confirmă la ghișeul primăriei.
            </Text>
          </Animated.View>
        ) : null}

        {unavailable ? (
          <View style={[styles.soft, { backgroundColor: c.brandWash, borderColor: c.brand }]}>
            <Ionicons name="cloud-offline-outline" size={17} color={c.brand} />
            <Text style={[styles.softText, { color: c.brand }]}>
              Asistentul nu răspunde acum. Încearcă din nou peste un moment.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.composer, { backgroundColor: c.surface, borderTopColor: c.line }]}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Scrie întrebarea ta…"
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
        <Button
          title={ask.isPending ? 'Se caută…' : 'Întreabă'}
          icon="arrow-forward"
          onPress={() => submit()}
          disabled={question.trim().length < 3 || ask.isPending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.five },
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
  pending: { alignItems: 'center', gap: 7, paddingVertical: Spacing.five },
  pendingText: { fontFamily: Fonts.medium, fontSize: 13.5 },
  pendingHint: { fontFamily: Fonts.regular, fontSize: 11.5 },
  asked: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18, marginBottom: Spacing.two },
  answer: { gap: Spacing.two },
  answerHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  seal: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  answerLabel: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.8 },
  answerText: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  sources: { gap: 5, marginTop: Spacing.one },
  sourcesLabel: { fontFamily: Fonts.semibold, fontSize: 9.5, letterSpacing: 1 },
  source: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sourceText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5 },
  disclaimer: { fontFamily: Fonts.regular, fontSize: 11.5, lineHeight: 16, marginTop: Spacing.two, textAlign: 'center' },
  soft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
  },
  softText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  composer: { padding: Spacing.three, borderTopWidth: 1, gap: Spacing.two },
  input: {
    minHeight: 46,
    maxHeight: 110,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 14.5,
    textAlignVertical: 'top',
  },
});
