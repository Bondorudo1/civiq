import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useComments, usePost } from '@/api/hooks';
import type { Comment } from '@/api/types';
import { Plaque } from '@/components/ui/plaque';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { Tag } from '@/components/ui/tag';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deadlineLabel } from '@/lib/date';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function CommentRow({ comment, reply }: { comment: Comment; reply?: boolean }) {
  const c = useTheme();
  return (
    <View style={[styles.comment, reply && { marginLeft: 30 }]}>
      <View style={[styles.avatar, { backgroundColor: reply ? c.greenWash : c.brandWash }]}>
        <Text style={[styles.avatarText, { color: reply ? c.green : c.brand }]}>{initials(comment.author.fullName)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.commentMeta}>
          <Text style={{ fontFamily: Fonts.semibold, color: c.text }}>{comment.author.fullName}</Text>
          <Text style={{ color: c.muted }}> · {new Date(comment.createdAt).toLocaleDateString('ro-MD')}</Text>
        </Text>
        <Text style={[styles.commentText, { color: c.text }]}>{comment.text}</Text>
        {!reply ? (
          <View style={styles.commentActions}>
            <Text style={[styles.commentAction, { color: c.accentPressed }]}>♥ {comment.likesCount}</Text>
            <Text style={[styles.commentAction, { color: c.textSecondary }]}>Răspunde</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading } = usePost(id);
  const { data: comments } = useComments(id);

  const [liked, setLiked] = useState(false);
  const [draft, setDraft] = useState('');

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const toggleLike = () => {
    setLiked((v) => !v);
    heartScale.value = withSequence(withSpring(1.35, { damping: 5, stiffness: 220 }), withSpring(1));
  };

  const roots = comments ?? [];

  const cat = post ? POST_TYPE[post.type] : null;
  const closed = post?.status === 'CLOSED';
  const dl = deadlineLabel(post?.deadline);
  const likeCount = (post?.likesCount ?? 0) + (liked ? 1 : 0);

  if (isLoading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
          <View style={styles.bar}>
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
              <Ionicons name="arrow-back" size={24} color={c.onBrand} />
            </Pressable>
            <Text style={[styles.barTitle, { color: c.onBrand }]}>Proiect</Text>
          </View>
        </SafeAreaView>
        {isLoading ? (
          <LoadingView label="Se încarcă…" />
        ) : (
          <EmptyState icon="alert-circle-outline" title="Proiect negăsit" message="Acest proiect nu există sau a fost eliminat." />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Proiect</Text>
          <Ionicons name="share-social-outline" size={22} color={c.onBrand} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {post?.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder, { backgroundColor: c.brandWash }]}>
            <Ionicons name={cat?.icon ?? 'document-text-outline'} size={40} color={c.brand} />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.metaRow}>
            {cat ? <Tag label={cat.label} bg={cat.bg} fg={cat.fg} icon={cat.icon} /> : null}
            {!closed && dl ? <Text style={[styles.deadline, { color: c.amber }]}>{dl}</Text> : null}
          </View>

          <Text style={[styles.title, { color: c.text }]}>{post?.title}</Text>
          <Text style={[styles.text, { color: c.textSecondary }]}>{post?.body}</Text>

          <View style={styles.reactions}>
            <Pressable
              onPress={toggleLike}
              style={[styles.reactBtn, { backgroundColor: liked ? c.accentWash : c.surface, borderColor: liked ? c.accent : c.line }]}>
              <Animated.View style={heartStyle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={c.accentPressed} />
              </Animated.View>
              <Text style={[styles.reactText, { color: liked ? c.accentPressed : c.textSecondary }]}>{likeCount}</Text>
            </Pressable>
            <View style={[styles.reactBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
              <Ionicons name="thumbs-down-outline" size={16} color={c.textSecondary} />
              <Text style={[styles.reactText, { color: c.textSecondary }]}>{post?.dislikesCount ?? 0}</Text>
            </View>
            <View style={[styles.reactBtn, styles.reactIcon, { backgroundColor: c.surface, borderColor: c.line }]}>
              <Ionicons name="chatbubble-outline" size={16} color={c.textSecondary} />
            </View>
          </View>

          {closed && post?.verdict ? (
            <Plaque borderColor={c.green} style={styles.verdict}>
              <View style={styles.verdictHead}>
                <Ionicons name="checkmark-circle" size={18} color={c.green} />
                <Text style={[styles.verdictLabel, { color: c.green }]}>Verdictul primăriei</Text>
              </View>
              <Text style={[styles.text, { color: c.text }]}>{post.verdict}</Text>
            </Plaque>
          ) : null}

          <View style={styles.commentsHead}>
            <Text style={[styles.commentsTitle, { color: c.textSecondary }]}>
              COMENTARII · {post?.commentsCount ?? roots.length}
            </Text>
            <View style={[styles.rule, { backgroundColor: c.line }]} />
          </View>

          {roots.map((cm) => (
            <View key={cm.id}>
              <CommentRow comment={cm} />
              {cm.replies.map((r) => (
                <CommentRow key={r.id} comment={r} reply />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.composer, { backgroundColor: c.surface, borderTopColor: c.line }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Scrie un comentariu…"
          placeholderTextColor={c.textSecondary}
          style={[styles.composerInput, { backgroundColor: c.background, color: c.text }]}
        />
        <Pressable style={[styles.send, { backgroundColor: c.brand }]}>
          <Ionicons name="send" size={17} color={c.onBrand} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { paddingBottom: Spacing.six },
  banner: { width: '100%', height: 150 },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: Spacing.four, gap: Spacing.two },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deadline: { fontFamily: Fonts.semibold, fontSize: 12 },
  title: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, marginTop: Spacing.one },
  text: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21 },
  reactions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 9 },
  reactIcon: { paddingHorizontal: 12 },
  reactText: { fontFamily: Fonts.semibold, fontSize: 13 },
  verdict: { marginTop: Spacing.three, gap: Spacing.two },
  verdictHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verdictLabel: { fontFamily: Fonts.semibold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4 },
  commentsHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.four, marginBottom: Spacing.one },
  commentsTitle: { fontFamily: Fonts.semibold, fontSize: 11, letterSpacing: 1 },
  rule: { flex: 1, height: 1 },
  comment: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 12 },
  commentMeta: { fontSize: 12.5 },
  commentText: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 19, marginTop: 2 },
  commentActions: { flexDirection: 'row', gap: Spacing.three, marginTop: 5 },
  commentAction: { fontFamily: Fonts.medium, fontSize: 12 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderTopWidth: 1 },
  composerInput: { flex: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 10, fontFamily: Fonts.regular, fontSize: 14 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
