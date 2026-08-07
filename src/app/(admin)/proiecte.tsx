import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { usePosts } from '@/api/hooks';
import { AdminHeader } from '@/components/admin-header';
import { Plaque } from '@/components/ui/plaque';
import { Tag } from '@/components/ui/tag';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';
import { shortDate } from '@/lib/date';

export default function AdminPostsScreen() {
  const c = useTheme();
  const t = useT(adminTabsText);
  const loc = useLocale();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePosts();
  const posts = data ?? [];
  const open = posts.filter((p) => p.status === 'OPEN').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader title={t.postsTitle} subtitle={t.postsSubtitle(open, posts.length)} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = POST_TYPE[item.type];
          const closed = item.status === 'CLOSED';
          return (
            <Plaque
              borderColor={closed ? c.green : undefined}
              onPress={() => router.push({ pathname: '/admin/post/[id]', params: { id: item.id } })}>
              <View style={styles.top}>
                <Tag label={meta.label[loc]} bg={meta.bg} fg={meta.fg} icon={meta.icon} />
                <Text style={[styles.state, { color: closed ? c.green : c.brand }]}>
                  {closed ? t.postClosed : t.postOpen}
                </Text>
              </View>
              <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.meta, { color: c.textSecondary }]}>
                <Text style={styles.mono}>{shortDate(item.createdAt, loc)}</Text> ·{' '}
                {t.postMeta(item.likesCount, item.commentsCount)}
              </Text>
            </Plaque>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.postsLoading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="document-text-outline"
              title={t.postsEmptyTitle}
              message={t.postsEmptyMessage}
              actionLabel={t.newPost}
              onAction={() => router.push('/admin/post/new')}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push('/admin/post/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: pressed ? c.brand : c.brandDeep }]}
        accessibilityRole="button"
        accessibilityLabel={t.newPost}>
        <Ionicons name="add" size={28} color={c.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 96 },
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
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  state: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  title: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  meta: { fontFamily: Fonts.regular, fontSize: 12.5, marginTop: 5 },
  mono: { fontFamily: Fonts.mono, fontSize: 12 },
});
