import { Ionicons } from '@expo/vector-icons';
import { enter } from '@/lib/motion';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useComplaints, useMe, usePosts } from '@/api/hooks';
import { AppHeader } from '@/components/app-header';
import { ProjectCard } from '@/components/project-card';
import { SectionLabel } from '@/components/ui/section-label';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { VerifyGate } from '@/components/verify-gate';
import { WaterTexture } from '@/components/water-texture';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useVerification } from '@/hooks/use-verification';
import { useLocale, useT } from '@/i18n';
import { homeText } from '@/i18n/home';
import { greeting } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function QuickAction({
  icon,
  label,
  bg,
  fg,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.qa,
        { backgroundColor: c.surface, borderColor: c.line, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}>
      <View style={[styles.qaIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={fg} />
      </View>
      <Text style={[styles.qaLabel, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const c = useTheme();
  const router = useRouter();
  const loc = useLocale();
  const t = useT(homeText);
  const { data: me } = useMe();
  const { canParticipate } = useVerification();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: complaints } = useComplaints();

  const firstName = me?.fullName.split(' ')[0] ?? '';
  const recent = (posts ?? []).slice(0, 3);
  const openCount = (posts ?? []).filter((p) => p.status === 'OPEN').length;
  const inProgress = (complaints ?? []).filter((cm) => cm.status === 'IN_PROGRESS').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title="CiviQ" showLogo onBell={() => router.push('/notifications')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={enter(FadeInDown.duration(450))}>
          <LinearGradient colors={[c.brand, c.brandDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.texture} pointerEvents="none">
              <WaterTexture width={230} height={190} color="#8FE0EF" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroGreeting}>{greeting(loc)},</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {firstName}
              </Text>
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{openCount}</Text>
                  <Text style={styles.statLabel}>{t.activeProjects(openCount)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{inProgress}</Text>
                  <Text style={styles.statLabel}>{t.complaintsInProgress(inProgress)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Learn the rule here rather than by bouncing off a locked action later. */}
        {!canParticipate ? (
          <Animated.View entering={enter(FadeInDown.duration(400).delay(90))} style={styles.gate}>
            <VerifyGate action="participate" />
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(FadeInDown.duration(400).delay(120))} style={styles.qaRow}>
          <QuickAction icon="megaphone-outline" label={t.qaReport} bg={c.accentWash} fg={c.accentPressed} onPress={() => router.push('/complaint/new')} />
          <QuickAction icon="documents-outline" label={t.qaProjects} bg={c.brandWash} fg={c.brand} onPress={() => router.push('/proiecte')} />
        </Animated.View>
        <Animated.View entering={enter(FadeInDown.duration(400).delay(180))} style={styles.qaRow}>
          <QuickAction icon="alert-circle-outline" label={t.qaMyComplaints} bg={c.amberWash} fg={c.amber} onPress={() => router.push('/contact')} />
          <QuickAction icon="sparkles-outline" label={t.qaAsk} bg={c.greenWash} fg={c.green} onPress={() => router.push('/ask')} />
        </Animated.View>

        <Animated.View entering={enter(FadeInDown.duration(400).delay(240))} style={{ marginTop: Spacing.two }}>
          <SectionLabel
            action={
              <Pressable onPress={() => router.push('/proiecte')}>
                <Text style={[styles.seeAll, { color: c.brand }]}>{t.seeAll}</Text>
              </Pressable>
            }>
            {t.recentProjects}
          </SectionLabel>
        </Animated.View>

        <View style={{ gap: Spacing.three }}>
          {postsLoading ? (
            <LoadingView />
          ) : recent.length === 0 ? (
            <EmptyState icon="file-tray-outline" title={t.noProjects} />
          ) : (
            recent.map((post, i) => (
              <Animated.View key={post.id} entering={enter(FadeInDown.duration(400).delay(300 + i * 80))}>
                <ProjectCard post={post} onPress={() => router.push({ pathname: '/project/[id]', params: { id: post.id } })} />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  hero: { borderRadius: Radius.xl, padding: Spacing.four, overflow: 'hidden', minHeight: 132, justifyContent: 'center' },
  texture: { position: 'absolute', right: -24, top: '50%', marginTop: -95 },
  heroText: { alignItems: 'flex-start' },
  heroGreeting: { fontFamily: Fonts.medium, fontSize: 13, color: '#BFE6EE' },
  heroName: { fontFamily: Fonts.bold, fontSize: 31, letterSpacing: -0.6, color: '#FFFFFF', marginTop: 2, marginBottom: 8 },
  statRow: { flexDirection: 'row', gap: Spacing.two },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.md,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statNum: { fontFamily: Fonts.bold, fontSize: 15, color: '#FFFFFF' },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11.5, color: '#DCF0F4' },
  gate: { paddingHorizontal: Spacing.three },
  qaRow: { flexDirection: 'row', gap: Spacing.three },
  qa: { flex: 1, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.two },
  qaIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 17 },
  seeAll: { fontFamily: Fonts.semibold, fontSize: 12 },
});
