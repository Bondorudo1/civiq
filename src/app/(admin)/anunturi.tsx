import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAdminNotifications } from '@/api/hooks';
import { AdminHeader } from '@/components/admin-header';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';
import { formatDate } from '@/lib/date';

export default function AdminNotificationsScreen() {
  const c = useTheme();
  const t = useT(adminTabsText);
  const loc = useLocale();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useAdminNotifications();
  const items = data ?? [];
  const mine = items.filter((n) => n.kind === 'MANUAL').length;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader title={t.noticesTitle} subtitle={t.noticesSubtitle(mine, items.length)} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // PARSED comes from the Premier Energy scraper — read-only, but deletable.
          const parsed = item.kind === 'PARSED';
          return (
            <Plaque onPress={() => router.push({ pathname: '/admin/notification/[id]', params: { id: item.id } })}>
              <View style={styles.top}>
                <Ionicons
                  name={parsed ? 'flash-outline' : 'megaphone-outline'}
                  size={16}
                  color={parsed ? '#8A5300' : c.brand}
                />
                <Text style={[styles.kind, { color: parsed ? '#8A5300' : c.brand }]}>
                  {parsed ? t.noticeParsed : t.noticeManual}
                </Text>
              </View>
              <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
                {item.title ?? t.noticeFallbackTitle}
              </Text>
              {item.body ? (
                <Text style={[styles.body, { color: c.textSecondary }]} numberOfLines={2}>
                  {item.body}
                </Text>
              ) : null}
              <Text style={[styles.date, { color: c.muted }]}>
                {formatDate(item.eventDate ?? item.createdAt, loc)}
              </Text>
            </Plaque>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.noticesLoading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="megaphone-outline"
              title={t.noticesEmptyTitle}
              message={t.noticesEmptyMessage}
              actionLabel={t.newNotice}
              onAction={() => router.push('/admin/notification/new')}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push('/admin/notification/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: pressed ? c.brand : c.brandDeep }]}
        accessibilityRole="button"
        accessibilityLabel={t.newNotice}>
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
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.two },
  kind: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9 },
  title: { fontFamily: Fonts.semibold, fontSize: 15.5, lineHeight: 20 },
  body: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 3 },
  date: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: Spacing.two },
});
