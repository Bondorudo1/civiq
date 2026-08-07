import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotifications } from '@/api/hooks';
import type { ComplaintStatusPayload, Notification, ParsedPayload } from '@/api/types';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { COMPLAINT_STATUS, WORK_TYPE } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Presented = { source: string; icon: IoniconName; bg: string; fg: string; title: string; body: string };

/** The frontend composes titles/bodies for PARSED and COMPLAINT_STATUS from payload. */
function present(n: Notification): Presented {
  if (n.kind === 'PARSED' && n.payload && 'workType' in n.payload) {
    const p = n.payload as ParsedPayload;
    return {
      source: `Premier Energy · ${WORK_TYPE[p.workType]}`,
      icon: 'flash-outline',
      bg: '#FBEFD9',
      fg: '#8A5300',
      title: WORK_TYPE[p.workType],
      body: p.segments.map((s) => `${s.streets}  ·  ${s.timeStart}–${s.timeEnd}`).join('\n'),
    };
  }
  if (n.kind === 'COMPLAINT_STATUS' && n.payload && 'complaintId' in n.payload) {
    const p = n.payload as ComplaintStatusPayload;
    return {
      source: 'Primăria Cahul',
      icon: 'clipboard-outline',
      bg: '#EAF6F8',
      fg: '#0E7490',
      title: `Sesizare: ${COMPLAINT_STATUS[p.status].label}`,
      body: p.adminResponse ?? `Statusul sesizării „${p.complaintTitle}” s-a actualizat.`,
    };
  }
  return {
    source: 'Primăria Cahul',
    icon: 'megaphone-outline',
    bg: '#EAF6F8',
    fg: '#0E7490',
    title: n.title ?? '',
    body: n.body ?? '',
  };
}

export default function NotificationsScreen() {
  const c = useTheme();
  const { data: items, isLoading, isError, refetch } = useNotifications();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Notificări</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingView label="Se încarcă notificările…" />
        ) : isError ? (
          <ErrorView onRetry={() => refetch()} />
        ) : (items ?? []).length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="Nicio notificare"
            message="Aici vei primi anunțuri de la primărie și de la Premier Energy."
          />
        ) : (
          (items ?? []).map((n) => {
            const v = present(n);
            return (
              <Plaque key={n.id}>
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
                <Text style={[styles.date, { color: c.muted }]}>{formatDate(n.eventDate ?? n.createdAt)}</Text>
              </Plaque>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  icon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  source: { fontFamily: Fonts.semibold, fontSize: 11.5, letterSpacing: 0.3, flex: 1, textTransform: 'uppercase' },
  unread: { width: 9, height: 9, borderRadius: 5 },
  title: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 3 },
  date: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: Spacing.two },
});
