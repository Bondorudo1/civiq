import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useLocale, useT } from '@/i18n';
import { projectsText } from '@/i18n/projects';

type Filter = 'ALL' | PostType;

export default function ProiecteScreen() {
  const c = useTheme();
  const t = useT(projectsText);
  const loc = useLocale();
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
    { key: 'ALL', label: t.all },
    ...types.map((ty) => ({ key: ty as Filter, label: POST_TYPE[ty].label[loc] })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader title={t.title} onBell={() => router.push('/notifications')} />

      <View style={styles.controls}>
        <Field icon="search-outline" placeholder={t.searchPlaceholder} value={query} onChangeText={setQuery} />
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

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(360).delay(index * 60)}>
            <ProjectCard post={item} onPress={() => router.push({ pathname: '/project/[id]', params: { id: item.id } })} />
          </Animated.View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.loading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="file-tray-outline"
              title={t.emptyTitle}
              message={query || filter !== 'ALL' ? t.emptyFiltered : t.emptyNone}
            />
          )
        }
      />
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
