import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePosts } from '@/api/hooks';
import type { PostType } from '@/api/types';
import { AppHeader } from '@/components/app-header';
import { ProjectCard } from '@/components/project-card';
import { Field } from '@/components/ui/field';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Filter = 'ALL' | PostType;

export default function ProiecteScreen() {
  const c = useTheme();
  const router = useRouter();
  const { data: posts, isLoading, isError, refetch } = usePosts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  const types = useMemo(
    () => Array.from(new Set((posts ?? []).map((p) => p.type))),
    [posts],
  );

  const list = (posts ?? []).filter((p) => {
    const matchType = filter === 'ALL' || p.type === filter;
    const q = query.trim().toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: 'ALL', label: 'Toate' },
    ...types.map((t) => ({ key: t as Filter, label: POST_TYPE[t].label })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title="Proiecte" onBell={() => router.push('/notifications')} />

      <View style={styles.controls}>
        <Field icon="search-outline" placeholder="Caută proiecte…" value={query} onChangeText={setQuery} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((ch) => {
            const active = filter === ch.key;
            return (
              <Pressable
                key={ch.key}
                onPress={() => setFilter(ch.key)}
                style={[
                  styles.chip,
                  { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brand : c.surface },
                ]}>
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.onBrand : c.textSecondary }}>
                  {ch.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingView label="Se încarcă proiectele…" />
        ) : isError ? (
          <ErrorView onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title="Niciun proiect"
            message={query || filter !== 'ALL' ? 'Nimic pentru filtrul ales.' : 'Nu există proiecte deocamdată.'}
          />
        ) : (
          list.map((post, i) => (
            <Animated.View key={post.id} entering={FadeInDown.duration(360).delay(i * 60)}>
              <ProjectCard post={post} onPress={() => router.push({ pathname: '/project/[id]', params: { id: post.id } })} />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.three },
  chips: { gap: Spacing.two, paddingRight: Spacing.three },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  empty: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', marginTop: Spacing.five },
});
