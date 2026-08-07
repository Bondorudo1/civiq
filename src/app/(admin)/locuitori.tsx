import { Ionicons } from '@expo/vector-icons';
import { enter } from '@/lib/motion';
import { useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAdminDecideVerification, useAdminVerifications } from '@/api/hooks';
import type { VerificationRequest } from '@/api/types';
import { AdminHeader } from '@/components/admin-header';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, ErrorView, LoadingView } from '@/components/ui/state-views';
import { confirmAction } from '@/lib/confirm';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';
import { formatDate } from '@/lib/date';

/** Operators see enough to check the claim, not the whole identifier. */
const maskIdnp = (idnp: string) => `${idnp.slice(0, 4)}•••••${idnp.slice(-4)}`;

function RequestCard({ item }: { item: VerificationRequest }) {
  const c = useTheme();
  const t = useT(adminTabsText);
  const loc = useLocale();
  const decide = useAdminDecideVerification();
  const [reason, setReason] = useState('');
  const [refusing, setRefusing] = useState(false);

  const pending = item.status === 'PENDING';
  const tone = item.status === 'VERIFIED' ? c.green : item.status === 'REJECTED' ? c.accentPressed : c.amber;

  const approve = () =>
    confirmAction({
      title: t.approveTitle,
      message: t.approveBody(item.user.fullName),
      confirmLabel: t.approve,
      cancelLabel: t.cancel,
      onConfirm: () => decide.mutate({ id: item.id, status: 'VERIFIED' }),
    });

  return (
    <Plaque borderColor={pending ? undefined : tone}>
      <View style={styles.top}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {item.user.fullName}
        </Text>
        <View style={[styles.pill, { backgroundColor: tone }]}>
          <Text style={styles.pillText}>{t.verification[item.status].toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="card-outline" size={14} color={c.brand} />
        <Text style={[styles.detail, { color: c.textSecondary }]}>
          IDNP <Text style={styles.mono}>{maskIdnp(item.idnp)}</Text>
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="home-outline" size={14} color={c.brand} />
        <Text style={[styles.detail, { color: c.textSecondary }]} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
      <Text style={[styles.date, { color: c.muted }]}>{t.filedOn(formatDate(item.createdAt, loc))}</Text>

      {item.reason ? (
        <Text style={[styles.reasonShown, { color: c.accentPressed }]}>{t.reasonShown(item.reason)}</Text>
      ) : null}

      {pending ? (
        refusing ? (
          <View style={styles.refuse}>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t.rejectPlaceholder}
              placeholderTextColor={c.textSecondary}
              underlineColorAndroid="transparent"
              maxLength={300}
              multiline
              style={[
                styles.reasonInput,
                { backgroundColor: c.brandWash, color: c.text },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
              ]}
            />
            <View style={styles.actions}>
              <Pressable onPress={() => setRefusing(false)} style={[styles.btn, styles.ghost, { borderColor: c.line }]}>
                <Text style={[styles.btnText, { color: c.textSecondary }]}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={() => decide.mutate({ id: item.id, status: 'REJECTED', reason })}
                disabled={reason.trim().length < 3 || decide.isPending}
                style={[styles.btn, { backgroundColor: c.accent, opacity: reason.trim().length < 3 ? 0.5 : 1 }]}>
                <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{t.reject}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable onPress={() => setRefusing(true)} style={[styles.btn, styles.ghost, { borderColor: c.line }]}>
              <Text style={[styles.btnText, { color: c.accentPressed }]}>{t.reject}</Text>
            </Pressable>
            <Pressable
              onPress={approve}
              disabled={decide.isPending}
              style={[styles.btn, { backgroundColor: c.brand }]}>
              <Ionicons name="checkmark" size={15} color={c.onBrand} />
              <Text style={[styles.btnText, { color: c.onBrand }]}>{t.approve}</Text>
            </Pressable>
          </View>
        )
      ) : null}
    </Plaque>
  );
}

export default function AdminResidentsScreen() {
  const c = useTheme();
  const t = useT(adminTabsText);
  const { data, isLoading, isError, refetch } = useAdminVerifications();
  const all = data ?? [];
  const waiting = all.filter((v) => v.status === 'PENDING');
  const [onlyPending, setOnlyPending] = useState(true);
  const list = onlyPending ? waiting : all;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AdminHeader
        title={t.residentsTitle}
        subtitle={waiting.length ? t.residentsWaiting(waiting.length) : t.residentsNoneWaiting}
      />

      <View style={styles.filterRow}>
        {[
          { key: true, label: t.filterPending(waiting.length) },
          { key: false, label: t.filterAllCount(all.length) },
        ].map((f) => {
          const active = onlyPending === f.key;
          return (
            <Pressable
              key={String(f.key)}
              onPress={() => setOnlyPending(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.tab, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brand : c.surface }]}>
              <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.onBrand : c.textSecondary }}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        style={styles.listFlex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={enter(FadeInDown.duration(320).delay(index * 50))}>
            <RequestCard item={item} />
          </Animated.View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingView label={t.residentsLoading} />
          ) : isError ? (
            <ErrorView onRetry={() => refetch()} />
          ) : (
            <EmptyState
              icon="shield-checkmark-outline"
              title={t.residentsEmptyTitle}
              message={t.residentsEmptyMessage}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexShrink: 0, gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  listFlex: { flex: 1 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: Spacing.three, paddingTop: 0, gap: Spacing.three, paddingBottom: Spacing.six },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, marginBottom: Spacing.two },
  name: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, letterSpacing: -0.2 },
  pill: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  pillText: { fontFamily: Fonts.bold, fontSize: 8.5, letterSpacing: 0.7, color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  detail: { flex: 1, fontFamily: Fonts.regular, fontSize: 12.5 },
  mono: { fontFamily: Fonts.mono, fontSize: 12 },
  date: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: 6 },
  reasonShown: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 17, marginTop: 5 },
  refuse: { gap: Spacing.two, marginTop: Spacing.three },
  reasonInput: {
    minHeight: 70,
    borderRadius: Radius.md,
    padding: Spacing.two,
    fontFamily: Fonts.regular,
    fontSize: 13.5,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  ghost: { borderWidth: 1 },
  btnText: { fontFamily: Fonts.semibold, fontSize: 13.5 },
});
