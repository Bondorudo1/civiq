import { Ionicons } from '@expo/vector-icons';
import { enter } from '@/lib/motion';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useComplaints } from '@/api/hooks';
import type { ComplaintStatus } from '@/api/types';
import { AppHeader } from '@/components/app-header';
import { Plaque } from '@/components/ui/plaque';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Tag } from '@/components/ui/tag';
import { COMPLAINT_STATUS, DEPARTMENT } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { complaintsText } from '@/i18n/complaints';
import { responseWindow, shortDate } from '@/lib/date';
import { shortRef } from '@/lib/id';

type Filter = 'ALL' | ComplaintStatus;

const FILTERS: Filter[] = ['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function ContactScreen() {
  const c = useTheme();
  const loc = useLocale();
  const t = useT(complaintsText);
  const router = useRouter();
  const { data: complaints, isLoading, isError, refetch } = useComplaints();
  const [filter, setFilter] = useState<Filter>('ALL');

  const all = complaints ?? [];
  const list = all.filter((cm) => filter === 'ALL' || cm.status === filter);
  const inWork = all.filter((cm) => cm.status === 'IN_PROGRESS').length;
  const awaiting = all.filter((cm) => cm.status === 'RESOLVED').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title={t.title} onBell={() => router.push('/notifications')} />

      <View style={[styles.statHeader, { backgroundColor: c.brand }]}>
        <Text style={styles.statSub}>{t.responsePromise}</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{inWork}</Text>
            <Text style={styles.statLabel}>{t.statInWork}</Text>
          </View>
          <View style={[styles.stat, styles.statMid]}>
            <Text style={styles.statNum}>{awaiting}</Text>
            <Text style={styles.statLabel}>{t.statAwaiting}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{all.length}</Text>
            <Text style={styles.statLabel}>{t.statTotal}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.tab, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brand : c.surface }]}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.onBrand : c.textSecondary }}>
                {f === 'ALL' ? t.filterAll : COMPLAINT_STATUS[f].label[loc]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        style={styles.listFlex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: cm, index }) => {
          const w = cm.status === 'IN_PROGRESS' ? responseWindow(cm.createdAt) : null;
          return (
            <Animated.View entering={enter(FadeInDown.duration(360).delay(index * 60))}>
              <Plaque onPress={() => router.push({ pathname: '/complaint/[id]', params: { id: cm.id } })}>
                <View style={styles.cardTop}>
                  <Text style={[styles.ref, { color: c.muted }]}>{shortRef(cm.id)}</Text>
                  <StatusPill status={cm.status} />
                </View>
                <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                  {cm.title}
                </Text>
                <Text style={[styles.dept, { color: c.textSecondary }]}>
                  {DEPARTMENT[cm.category][loc]} · <Text style={styles.mono}>{t.filed(shortDate(cm.createdAt, loc))}</Text>
                </Text>
                {w ? (
                  <View style={styles.window}>
                    <View style={styles.windowRow}>
                      <Text style={[styles.windowLabel, { color: c.amber }]}>{t.responseTerm}</Text>
                      <Text style={[styles.windowVal, { color: c.amber }]}>{t.windowValue(w.remaining, w.total)}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${(w.elapsed / w.total) * 100}%` }]} />
                    </View>
                  </View>
                ) : null}
              </Plaque>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.loading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              title={t.emptyTitle}
              message={filter !== 'ALL' ? t.emptyFiltered : t.emptyPrompt}
              actionLabel={filter === 'ALL' ? t.newComplaint : undefined}
              onAction={filter === 'ALL' ? () => router.push('/complaint/new') : undefined}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push('/complaint/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: pressed ? c.brandDeep : c.brand }]}
        accessibilityRole="button"
        accessibilityLabel={t.newComplaint}>
        <Ionicons name="add" size={28} color={c.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { flexGrow: 0, flexShrink: 0 },
  listFlex: { flex: 1 },
  tabs: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.three, paddingBottom: 96 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  cardDate: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: Spacing.one },
  statHeader: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, paddingTop: 2, gap: Spacing.two },
  statSub: { fontFamily: Fonts.medium, fontSize: 12, color: '#CFE9EF' },
  statRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.md, paddingVertical: 8 },
  stat: { flex: 1, alignItems: 'center' },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  statNum: { fontFamily: Fonts.mono, fontSize: 18, color: '#FFFFFF' },
  statLabel: { fontFamily: Fonts.regular, fontSize: 10.5, color: '#CFE9EF' },
  ref: { fontFamily: Fonts.mono, fontSize: 12 },
  mono: { fontFamily: Fonts.mono, fontSize: 12 },
  dept: { fontFamily: Fonts.regular, fontSize: 12.5, marginTop: 4 },
  window: { marginTop: 9, gap: 3 },
  windowRow: { flexDirection: 'row', justifyContent: 'space-between' },
  windowLabel: { fontFamily: Fonts.medium, fontSize: 11 },
  windowVal: { fontFamily: Fonts.mono, fontSize: 11.5 },
  track: { height: 4, borderRadius: 2, backgroundColor: '#EEE7D6', overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#B26A00' },
  empty: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.six, paddingHorizontal: Spacing.four },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6,
  },
});
