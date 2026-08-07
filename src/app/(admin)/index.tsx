import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAdminComplaints } from '@/api/hooks';
import type { ComplaintStatus } from '@/api/types';
import { AdminHeader } from '@/components/admin-header';
import { Plaque } from '@/components/ui/plaque';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { COMPLAINT_CATEGORY, COMPLAINT_STATUS } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';
import { responseWindow, shortDate } from '@/lib/date';
import { shortRef } from '@/lib/id';

type Filter = 'ALL' | ComplaintStatus;

const FILTERS: Filter[] = ['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function AdminQueueScreen() {
  const c = useTheme();
  const t = useT(adminTabsText);
  const loc = useLocale();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('ALL');
  const { data, isLoading, isError, refetch } = useAdminComplaints(
    filter === 'ALL' ? undefined : { status: filter },
  );
  const { data: all } = useAdminComplaints();

  const list = data ?? [];
  const queue = all ?? [];
  const untouched = queue.filter((x) => x.status === 'NEW').length;
  const working = queue.filter((x) => x.status === 'IN_PROGRESS').length;
  // Anything past its 30-day window is the number that should worry an operator.
  const overdue = queue.filter(
    (x) => (x.status === 'NEW' || x.status === 'IN_PROGRESS') && responseWindow(x.createdAt).remaining <= 0,
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader title={t.queueTitle} subtitle={t.queueSubtitle} />

      <View style={[styles.stats, { backgroundColor: c.brandDeep }]}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{untouched}</Text>
            <Text style={styles.statLabel}>{t.statNew}</Text>
          </View>
          <View style={[styles.stat, styles.statMid]}>
            <Text style={styles.statNum}>{working}</Text>
            <Text style={styles.statLabel}>{t.statInWork}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, overdue > 0 && styles.statAlarm]}>{overdue}</Text>
            <Text style={styles.statLabel}>{t.statOverdue}</Text>
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
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const open = item.status === 'NEW' || item.status === 'IN_PROGRESS';
          const w = open ? responseWindow(item.createdAt) : null;
          const late = !!w && w.remaining <= 0;
          return (
            <Animated.View entering={FadeInDown.duration(320).delay(index * 50)}>
              <Plaque
                borderColor={late ? c.accent : undefined}
                onPress={() => router.push({ pathname: '/admin/complaint/[id]', params: { id: item.id } })}>
                <View style={styles.cardTop}>
                  <Text style={[styles.ref, { color: c.muted }]}>{shortRef(item.id)}</Text>
                  <StatusPill status={item.status} />
                </View>
                <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.meta, { color: c.textSecondary }]} numberOfLines={1}>
                  {COMPLAINT_CATEGORY[item.category].label[loc]} · {item.author.fullName} ·{' '}
                  <Text style={styles.mono}>{shortDate(item.createdAt, loc)}</Text>
                </Text>
                {w ? (
                  <Text style={[styles.window, { color: late ? c.accentPressed : c.amber }]}>
                    {late ? t.overdueBy(Math.abs(w.remaining)) : t.daysLeft(w.remaining)}
                  </Text>
                ) : null}
              </Plaque>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.queueLoading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="checkmark-done-outline"
              title={t.queueEmptyTitle}
              message={filter === 'ALL' ? t.queueEmptyAll : t.queueEmptyFiltered}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
  statRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.md, paddingVertical: 8 },
  stat: { flex: 1, alignItems: 'center' },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  statNum: { fontFamily: Fonts.mono, fontSize: 18, color: '#FFFFFF' },
  statAlarm: { color: '#FFB3C0' },
  statLabel: { fontFamily: Fonts.regular, fontSize: 10.5, color: '#9FD3DF' },
  tabsWrap: { flexGrow: 0 },
  tabs: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.three, paddingBottom: Spacing.six },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  ref: { fontFamily: Fonts.mono, fontSize: 12 },
  mono: { fontFamily: Fonts.mono, fontSize: 12 },
  title: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  meta: { fontFamily: Fonts.regular, fontSize: 12.5, marginTop: 4 },
  window: { fontFamily: Fonts.semibold, fontSize: 11.5, marginTop: 6 },
});
