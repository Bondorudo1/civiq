import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useComplaint } from '@/api/hooks';
import { Plaque } from '@/components/ui/plaque';
import { StatusPill } from '@/components/ui/status-pill';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { Tag } from '@/components/ui/tag';
import { COMPLAINT_CATEGORY, DEPARTMENT } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/date';
import { shortRef } from '@/lib/id';

type Step = { label: string; date: string | null; done: boolean; current?: boolean; color: string };

export default function ComplaintDetailScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cm, isLoading } = useComplaint(id);

  const cat = cm ? COMPLAINT_CATEGORY[cm.category] : null;

  const steps: Step[] = cm
    ? [
        { label: 'Trimisă', date: cm.createdAt, done: true, color: c.brand },
        {
          label: 'În lucru',
          date: cm.status !== 'NEW' ? cm.updatedAt : null,
          done: cm.status !== 'NEW',
          current: cm.status === 'IN_PROGRESS',
          color: c.amber,
        },
        cm.status === 'REJECTED'
          ? { label: 'Respinsă', date: cm.updatedAt, done: true, color: c.statusRejected }
          : { label: 'Rezolvată', date: cm.status === 'RESOLVED' ? cm.updatedAt : null, done: cm.status === 'RESOLVED', color: c.green },
      ]
    : [];

  if (isLoading || !cm) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
          <View style={styles.bar}>
            <Ionicons name="arrow-back" size={24} color={c.onBrand} onPress={() => router.back()} />
            <Text style={[styles.barTitle, { color: c.onBrand }]}>Sesizare</Text>
          </View>
        </SafeAreaView>
        {isLoading ? (
          <LoadingView label="Se încarcă…" />
        ) : (
          <EmptyState icon="alert-circle-outline" title="Sesizare negăsită" message="Această sesizare nu există sau nu îți aparține." />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Ionicons name="arrow-back" size={24} color={c.onBrand} onPress={() => router.back()} />
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Sesizare</Text>
          <Text style={styles.barRef}>{shortRef(cm.id)}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metaRow}>
          {cat ? <Tag label={cat.label} bg={cat.bg} fg={cat.fg} icon={cat.icon} /> : null}
          {cm ? <StatusPill status={cm.status} /> : null}
        </View>

        <Text style={[styles.title, { color: c.text }]}>{cm?.title}</Text>
        <View style={styles.deptRow}>
          <Ionicons name="business-outline" size={15} color={c.brand} />
          <Text style={[styles.dept, { color: c.text }]}>Responsabil: {DEPARTMENT[cm.category]}</Text>
        </View>
        <Text style={[styles.text, { color: c.textSecondary }]}>{cm?.description}</Text>

        {cm?.photoUrl ? <Image source={{ uri: cm.photoUrl }} style={styles.photo} contentFit="cover" /> : null}

        {cm?.address ? (
          <View style={styles.addr}>
            <Ionicons name="location-outline" size={16} color={c.brand} />
            <Text style={[styles.addrText, { color: c.text }]}>{cm.address}</Text>
          </View>
        ) : null}

        <Text style={[styles.section, { color: c.textSecondary }]}>EVOLUȚIE</Text>
        <View style={styles.timeline}>
          {steps.map((s, i) => (
            <View key={s.label} style={styles.step}>
              <View style={styles.railCol}>
                <View style={[styles.dot, { backgroundColor: s.done ? s.color : c.surface, borderColor: s.done ? s.color : c.line }]}>
                  {s.done ? <Ionicons name="checkmark" size={11} color="#FFFFFF" /> : null}
                </View>
                {i < steps.length - 1 ? <View style={[styles.rail, { backgroundColor: s.done ? s.color : c.line }]} /> : null}
              </View>
              <View style={styles.stepBody}>
                <Text style={[styles.stepLabel, { color: s.done ? c.text : c.muted }]}>{s.label}</Text>
                {s.date ? <Text style={[styles.stepDate, { color: c.muted }]}>{formatDate(s.date)}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {cm?.adminResponse ? (
          <Plaque borderColor={c.brand} style={styles.response}>
            <View style={styles.responseHead}>
              <Ionicons name="business-outline" size={16} color={c.brand} />
              <Text style={[styles.responseLabel, { color: c.brand }]}>Răspunsul primăriei</Text>
            </View>
            <Text style={[styles.text, { color: c.text }]}>{cm.adminResponse}</Text>
          </Plaque>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  barRef: { fontFamily: Fonts.mono, fontSize: 13, color: '#CFE9EF', marginLeft: 'auto' },
  deptRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  dept: { fontFamily: Fonts.medium, fontSize: 13.5 },
  content: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, marginTop: Spacing.one },
  text: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  photo: { width: '100%', height: 180, borderRadius: Radius.md, marginTop: Spacing.two },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.two },
  addrText: { fontFamily: Fonts.medium, fontSize: 13.5 },
  section: { fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 1, marginTop: Spacing.four },
  timeline: { marginTop: Spacing.two },
  step: { flexDirection: 'row', gap: Spacing.three },
  railCol: { alignItems: 'center', width: 22 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rail: { width: 2, flex: 1, minHeight: 24, marginVertical: 2 },
  stepBody: { flex: 1, paddingBottom: Spacing.three },
  stepLabel: { fontFamily: Fonts.semibold, fontSize: 14 },
  stepDate: { fontFamily: Fonts.mono, fontSize: 12, marginTop: 2 },
  response: { marginTop: Spacing.three, gap: Spacing.two },
  responseHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  responseLabel: { fontFamily: Fonts.semibold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4 },
});
