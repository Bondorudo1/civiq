import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Post } from '@/api/types';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deadlineLabel } from '@/lib/date';

import { Plaque } from './ui/plaque';
import { Tag } from './ui/tag';

export function ProjectCard({ post, onPress }: { post: Post; onPress?: () => void }) {
  const c = useTheme();
  const cat = POST_TYPE[post.type];
  const closed = post.status === 'CLOSED';
  const dl = deadlineLabel(post.deadline);

  return (
    <Plaque onPress={onPress} borderColor="#CFE3E7">
      <View style={styles.topRow}>
        <Tag label={cat.label} bg={cat.bg} fg={cat.fg} icon={cat.icon} />
        {closed ? (
          <View style={[styles.verdict, { borderColor: c.green }]}>
            <Text style={[styles.verdictText, { color: c.green }]}>Verdict</Text>
          </View>
        ) : dl ? (
          <Text style={[styles.deadline, { color: c.amber }]}>{dl}</Text>
        ) : null}
      </View>

      <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={[styles.body, { color: c.textSecondary }]} numberOfLines={2}>
        {post.body}
      </Text>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="heart-outline" size={15} color={c.accentPressed} />
          <Text style={[styles.statText, { color: c.textSecondary }]}>{post.likesCount}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={14} color={c.textSecondary} />
          <Text style={[styles.statText, { color: c.textSecondary }]}>{post.commentsCount}</Text>
        </View>
      </View>
    </Plaque>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.two },
  verdict: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, transform: [{ rotate: '-3deg' }] },
  verdictText: { fontFamily: Fonts.semibold, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase' },
  deadline: { fontFamily: Fonts.semibold, fontSize: 11.5 },
  title: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  footer: { flexDirection: 'row', gap: Spacing.four, marginTop: Spacing.two },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontFamily: Fonts.medium, fontSize: 12.5 },
});
