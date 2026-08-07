import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useComplaints } from '@/api/hooks';
import type { ComplaintStatus } from '@/api/types';
import { AppHeader } from '@/components/app-header';
import { Plaque } from '@/components/ui/plaque';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Tag } from '@/components/ui/tag';
import { COMPLAINT_CATEGORY, COMPLAINT_STATUS } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/date';

type Filter = 'ALL' | ComplaintStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Toate' },
  { key: 'NEW', label: COMPLAINT_STATUS.NEW.label },
  { key: 'IN_PROGRESS', label: COMPLAINT_STATUS.IN_PROGRESS.label },
  { key: 'RESOLVED', label: COMPLAINT_STATUS.RESOLVED.label },
  { key: 'REJECTED', label: COMPLAINT_STATUS.REJECTED.label },
];

export default function ContactScreen() {
  const c = useTheme();
  const router = useRouter();
  const { data: complaints, isLoading, isError, refetch } = useComplaints();
  const [filter, setFilter] = useState<Filter>('ALL');

  const list = (complaints ?? []).filter((cm) => filter === 'ALL' || cm.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title="Sesizări" onBell={() => router.push('/notifications')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.tab, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brand : c.surface }]}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.onBrand : c.textSecondary }}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingView label="Se încarcă sesizările…" />
        ) : isError ? (
          <ErrorView onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="Nicio sesizare"
            message={filter !== 'ALL' ? 'Nimic cu acest status.' : 'Ai observat o problemă în oraș? Anunță primăria.'}
            actionLabel={filter === 'ALL' ? 'Sesizare nouă' : undefined}
            onAction={filter === 'ALL' ? () => router.push('/complaint/new') : undefined}
          />
        ) : (
          list.map((cm, i) => {
            const cat = COMPLAINT_CATEGORY[cm.category];
            return (
              <Animated.View key={cm.id} entering={FadeInDown.duration(360).delay(i * 60)}>
                <Plaque onPress={() => router.push({ pathname: '/complaint/[id]', params: { id: cm.id } })}>
                  <View style={styles.cardTop}>
                    <Tag label={cat.label} bg={cat.bg} fg={cat.fg} icon={cat.icon} />
                    <StatusPill status={cm.status} />
                  </View>
                  <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                    {cm.title}
                  </Text>
                  <Text style={[styles.cardDate, { color: c.muted }]}>{formatDate(cm.createdAt)}</Text>
                </Plaque>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/complaint/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: pressed ? c.brandDeep : c.brand }]}
        accessibilityRole="button"
        accessibilityLabel="Sesizare nouă">
        <Ionicons name="add" size={28} color={c.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { flexGrow: 0 },
  tabs: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.three, paddingBottom: 96 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  cardDate: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: Spacing.one },
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
