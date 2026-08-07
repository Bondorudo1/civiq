import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { type ComponentProps, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/api/hooks';
import type { ComplaintStatusPayload, Locale, Notification, NotificationKind, ParsedPayload } from '@/api/types';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { COMPLAINT_STATUS, WORK_TYPE } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { complaintDetailText } from '@/i18n/complaintDetail';
import { formatDate } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
/** This screen's copy in one language — `present` runs outside the component. */
type Copy = (typeof complaintDetailText)['ro'];

const KINDS: (NotificationKind | 'ALL')[] = ['ALL', 'COMPLAINT_STATUS', 'MANUAL', 'PARSED'];

/** Where a notification leads. MANUAL announcements are self-contained, so: null. */
type Target = { kind: 'route'; id: string } | { kind: 'url'; url: string } | null;

type Presented = {
  source: string;
  icon: IoniconName;
  bg: string;
  fg: string;
  title: string;
  body: string;
  target: Target;
  /** Labels the destination, so the row never promises more than it delivers. */
  action?: string;
};

/** The frontend composes titles/bodies for PARSED and COMPLAINT_STATUS from payload. */
function present(n: Notification, t: Copy, loc: Locale): Presented {
  if (n.kind === 'PARSED' && n.payload && 'workType' in n.payload) {
    const p = n.payload as ParsedPayload;
    return {
      source: t.outageSource(WORK_TYPE[p.workType][loc]),
      icon: 'flash-outline',
      bg: '#FBEFD9',
      fg: '#8A5300',
      title: WORK_TYPE[p.workType][loc],
      body: p.segments.map((s) => `${s.streets}  ·  ${s.timeStart}–${s.timeEnd}`).join('\n'),
      target: { kind: 'url', url: p.url },
      action: t.outageAction,
    };
  }
  if (n.kind === 'COMPLAINT_STATUS' && n.payload && 'complaintId' in n.payload) {
    const p = n.payload as ComplaintStatusPayload;
    return {
      source: t.cityHall,
      icon: 'clipboard-outline',
      bg: '#EAF6F8',
      fg: '#0E7490',
      title: t.complaintStatusTitle(COMPLAINT_STATUS[p.status].label[loc]),
      body: p.adminResponse ?? t.complaintStatusBody(p.complaintTitle),
      target: { kind: 'route', id: p.complaintId },
      action: t.complaintAction,
    };
  }
  return {
    source: t.cityHall,
    icon: 'megaphone-outline',
    bg: '#EAF6F8',
    fg: '#0E7490',
    title: n.title ?? '',
    body: n.body ?? '',
    target: null,
  };
}

export default function NotificationsScreen() {
  const c = useTheme();
  const t = useT(complaintDetailText);
  const loc = useLocale();
  const { data: items, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  // Mirrors GET /notifications?kind= — the one axis the endpoint filters on.
  const [kind, setKind] = useState<NotificationKind | 'ALL'>('ALL');

  const all = items ?? [];
  const unread = all.filter((n) => !n.isRead).length;
  const list = all.filter((n) => kind === 'ALL' || n.kind === kind);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.back}>
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>{t.notificationsTitle}</Text>
          {unread > 0 ? (
            <Pressable
              onPress={() => markAll.mutate()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t.markAllA11y(unread)}
              style={styles.markAll}>
              <Text style={[styles.markAllText, { color: c.onBrand }]}>{t.markAll}</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {KINDS.map((k) => {
          const active = kind === k;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.tab, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brand : c.surface }]}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.onBrand : c.textSecondary }}>
                {t.kinds[k]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        style={styles.listFlex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: n }) => {
          const v = present(n, t, loc);
          const target = v.target;
          // Reading it is what marks it read — the badge drops as you work the list.
          const open = target
            ? () => {
                if (!n.isRead) markRead.mutate(n.id);
                if (target.kind === 'route') {
                  router.push({ pathname: '/complaint/[id]', params: { id: target.id } });
                } else {
                  WebBrowser.openBrowserAsync(target.url, {
                    toolbarColor: c.brand,
                    controlsColor: '#FFFFFF',
                  });
                }
              }
            : undefined;

          return (
            <Plaque onPress={open}>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: v.bg }]}>
                  <Ionicons name={v.icon} size={18} color={v.fg} />
                </View>
                <Text style={[styles.source, { color: v.fg }]} numberOfLines={1}>
                  {v.source}
                </Text>
                {!n.isRead ? <View style={[styles.unread, { backgroundColor: c.accent }]} /> : null}
              </View>
              <Text style={[styles.title, { color: c.text }]}>{v.title}</Text>
              <Text style={[styles.body, { color: c.textSecondary }]}>{v.body}</Text>
              <View style={styles.foot}>
                <Text style={[styles.date, { color: c.muted }]}>{formatDate(n.eventDate ?? n.createdAt, loc)}</Text>
                {target ? (
                  <View style={styles.cta}>
                    <Text style={[styles.ctaText, { color: c.brand }]}>{v.action}</Text>
                    <Ionicons
                      name={target.kind === 'url' ? 'open-outline' : 'chevron-forward'}
                      size={13}
                      color={c.brand}
                    />
                  </View>
                ) : null}
              </View>
            </Plaque>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.loadingNotifications} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState icon="notifications-off-outline" title={t.emptyTitle} message={t.emptyMessage} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  tabsWrap: { flexGrow: 0, flexShrink: 0 },
  listFlex: { flex: 1 },
  tabs: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  markAll: { marginLeft: 'auto' },
  markAllText: { fontFamily: Fonts.semibold, fontSize: 12.5 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  icon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  source: { fontFamily: Fonts.semibold, fontSize: 11.5, letterSpacing: 0.3, flex: 1, textTransform: 'uppercase' },
  unread: { width: 9, height: 9, borderRadius: 5 },
  title: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 3 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  date: { fontFamily: Fonts.medium, fontSize: 11.5 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ctaText: { fontFamily: Fonts.semibold, fontSize: 12 },
});
