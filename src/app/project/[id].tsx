import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useComments,
  useCommentsSummary,
  useCreateComment,
  useDeleteComment,
  usePost,
  useReactToComment,
  useReactToPost,
  useTranslatePost,
} from '@/api/hooks';
import type { AiLanguage, Comment, ReactionKind } from '@/api/types';
import { Button } from '@/components/ui/button';
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

function CommentRow({
  comment,
  reply,
  onReply,
  cityId,
}: {
  comment: Comment;
  reply?: boolean;
  onReply?: (c: Comment) => void;
  /** The post's own author — only the city can publish a consultation. */
  cityId?: string;
}) {
  const c = useTheme();
  const reactTo = useReactToComment(comment.postId);
  const remove = useDeleteComment(comment.postId);

  const date = new Date(comment.createdAt).toLocaleDateString('ro-MD');
  const state = reactTo.data ?? {
    myReaction: comment.myReaction ?? null,
    likesCount: comment.likesCount,
    dislikesCount: comment.dislikesCount,
  };
  const liked = state.myReaction === 'LIKE';
  const likes = state.likesCount;
  // The contract's author object is only { id, full_name } — no role. The city
  // replying under its own consultation is the strongest official signal available.
  const official = !!cityId && comment.author.id === cityId;

  const actions = (
    <View style={styles.commentActions}>
      <Pressable
        onPress={() => reactTo.mutate({ id: comment.id, value: 'LIKE' })}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: liked }}
        accessibilityLabel={`Apreciez, ${likes}`}
        style={styles.commentActionBtn}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={c.accentPressed} />
        <Text style={[styles.commentAction, { color: c.accentPressed }]}>{likes}</Text>
      </Pressable>
      {!reply && onReply ? (
        <Pressable onPress={() => onReply(comment)} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.commentAction, { color: c.textSecondary }]}>Răspunde</Text>
        </Pressable>
      ) : null}
      {/* can_delete: own comment, or ADMIN. */}
      {comment.canDelete ? (
        <Pressable
          onPress={() => remove.mutate(comment.id)}
          hitSlop={8}
          disabled={remove.isPending}
          accessibilityRole="button"
          accessibilityLabel="Șterge comentariul">
          <Text style={[styles.commentAction, { color: c.muted }]}>Șterge</Text>
        </Pressable>
      ) : null}
    </View>
  );

  // A word from the city carries authority, so it's set as an engraved nameplate —
  // sealed, teal-edged, titled by office — not as one more voice in the thread.
  if (official) {
    return (
      <View
        style={[
          styles.official,
          { backgroundColor: c.brandWash, borderColor: c.brand },
          reply && { marginLeft: 30 },
        ]}>
        <View style={[styles.officialEdge, { backgroundColor: c.brand }]} />
        <View style={styles.officialInner}>
          <View style={styles.officialHead}>
            <View style={[styles.seal, { backgroundColor: c.brand }]}>
              <Ionicons name="shield-checkmark" size={16} color={c.onBrand} />
            </View>
            <View style={styles.officialWho}>
              <Text style={[styles.officialName, { color: c.brandDeep }]} numberOfLines={1}>
                {comment.author.fullName}
              </Text>
              <Text style={[styles.officialDate, { color: c.brand }]}>{date}</Text>
            </View>
            <View style={[styles.officialChip, { backgroundColor: c.brand }]}>
              <Text style={styles.officialChipText}>RĂSPUNS OFICIAL</Text>
            </View>
          </View>
          <Text style={[styles.officialText, { color: c.text }]}>{comment.text}</Text>
          {actions}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.comment, reply && { marginLeft: 30 }]}>
      <View style={[styles.avatar, { backgroundColor: reply ? c.greenWash : c.brandWash }]}>
        <Text style={[styles.avatarText, { color: reply ? c.green : c.brand }]}>{initials(comment.author.fullName)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.commentMeta}>
          <Text style={{ fontFamily: Fonts.semibold, color: c.text }}>{comment.author.fullName}</Text>
          <Text style={{ color: c.muted }}> · {date}</Text>
        </Text>
        <Text style={[styles.commentText, { color: c.text }]}>{comment.text}</Text>
        {actions}
      </View>
    </View>
  );
}

export default function ProjectDetailScreen() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading } = usePost(id);
  const { data: comments } = useComments(id);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [language, setLanguage] = useState<AiLanguage | null>(null);
  const inputRef = useRef<TextInput>(null);

  const postReaction = useReactToPost(id);
  const createComment = useCreateComment(id);
  const translate = useTranslatePost(id);
  const summary = useCommentsSummary(id);

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));
  const react = (kind: ReactionKind) => {
    if (kind === 'LIKE') {
      heartScale.value = withSequence(withSpring(1.35, { damping: 5, stiffness: 220 }), withSpring(1));
    }
    postReaction.mutate(kind);
  };

  const startReply = (target: Comment) => {
    setReplyTo(target);
    inputRef.current?.focus();
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    createComment.mutate({ text, parentId: replyTo?.id ?? null });
    setDraft('');
    setReplyTo(null);
  };

  const pickLanguage = (lang: AiLanguage) => {
    setLanguage(lang);
    translate.mutate(lang);
  };

  const roots = comments ?? [];

  const cat = post ? POST_TYPE[post.type] : null;
  const closed = post?.status === 'CLOSED';
  const dl = deadlineLabel(post?.deadline);
  // The react endpoint answers with the authoritative counts, so prefer them.
  const r = postReaction.data ?? {
    myReaction: post?.myReaction ?? null,
    likesCount: post?.likesCount ?? 0,
    dislikesCount: post?.dislikesCount ?? 0,
  };
  const liked = r.myReaction === 'LIKE';
  const disliked = r.myReaction === 'DISLIKE';
  const likeCount = r.likesCount;
  const dislikeCount = r.dislikesCount;
  const commentCount = post?.commentsCount ?? 0;

  const translated = language && language !== post?.lang ? translate.data : null;
  const shownTitle = translated?.title ?? post?.title;
  const shownBody = translated?.body ?? post?.body;

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Proiect</Text>
          <Pressable
            onPress={() => Share.share({ message: `${post.title}\n\nConsultare publică — CiviQ Cahul` })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Distribuie proiectul">
            <Ionicons name="share-social-outline" size={22} color={c.onBrand} />
          </Pressable>
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

          <Text style={[styles.title, { color: c.text }]}>{shownTitle}</Text>
          <Text style={[styles.text, { color: c.textSecondary }]}>{shownBody}</Text>

          {/* POST /posts/{id}/translate — the original language is free and cached. */}
          <View style={styles.langRow}>
            <Ionicons name="language-outline" size={15} color={c.muted} />
            {(['ro', 'ru', 'en', 'gag'] as AiLanguage[]).map((lang) => {
              const active = (language ?? post.lang) === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => pickLanguage(lang)}
                  disabled={translate.isPending}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.langChip, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : 'transparent' }]}>
                  <Text style={[styles.langText, { color: active ? c.brand : c.textSecondary }]}>
                    {lang.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
            {translate.isPending ? <ActivityIndicator size="small" color={c.brand} /> : null}
          </View>
          {translated ? (
            <Text style={[styles.machineNote, { color: c.muted }]}>
              Tradus automat{translated.cached ? ' · din cache' : ''}
            </Text>
          ) : null}
          {translate.isError ? (
            <Text style={[styles.machineNote, { color: c.amber }]}>
              Traducerea nu e disponibilă acum. Încearcă din nou.
            </Text>
          ) : null}

          <View style={styles.reactions}>
            <Pressable
              onPress={() => react('LIKE')}
              accessibilityRole="button"
              accessibilityState={{ selected: liked }}
              accessibilityLabel={`Susțin, ${likeCount}`}
              style={[styles.reactBtn, { backgroundColor: liked ? c.accentWash : c.surface, borderColor: liked ? c.accent : c.line }]}>
              <Animated.View style={heartStyle}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={c.accentPressed} />
              </Animated.View>
              <Text style={[styles.reactText, { color: liked ? c.accentPressed : c.textSecondary }]}>{likeCount}</Text>
            </Pressable>
            <Pressable
              onPress={() => react('DISLIKE')}
              accessibilityRole="button"
              accessibilityState={{ selected: disliked }}
              accessibilityLabel={`Nu susțin, ${dislikeCount}`}
              style={[styles.reactBtn, { backgroundColor: disliked ? c.brandWash : c.surface, borderColor: disliked ? c.brand : c.line }]}>
              <Ionicons name={disliked ? 'thumbs-down' : 'thumbs-down-outline'} size={16} color={disliked ? c.brand : c.textSecondary} />
              <Text style={[styles.reactText, { color: disliked ? c.brand : c.textSecondary }]}>{dislikeCount}</Text>
            </Pressable>
            <Pressable
              onPress={() => inputRef.current?.focus()}
              accessibilityRole="button"
              accessibilityLabel={`Comentează, ${commentCount} comentarii`}
              style={[styles.reactBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
              <Ionicons name="chatbubble-outline" size={16} color={c.textSecondary} />
              <Text style={[styles.reactText, { color: c.textSecondary }]}>{commentCount}</Text>
            </Pressable>
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

          {/* POST /posts/{id}/comments/summary — 409 NOT_ENOUGH_COMMENTS below two. */}
          {commentCount >= 2 ? (
            <Plaque borderColor={summary.data ? c.brand : c.line} style={styles.summary}>
              <View style={styles.summaryHead}>
                <Ionicons name="sparkles" size={15} color={c.brand} />
                <Text style={[styles.summaryLabel, { color: c.brand }]}>SINTEZA DISCUȚIEI</Text>
                {summary.data ? (
                  <Text style={[styles.summaryCount, { color: c.muted }]}>
                    {summary.data.basedOn} mesaje
                  </Text>
                ) : null}
              </View>
              {summary.data ? (
                <Text style={[styles.text, { color: c.text }]}>{summary.data.summary}</Text>
              ) : (
                <Text style={[styles.text, { color: c.textSecondary }]}>
                  Vezi pe scurt ce spun cei {commentCount} participanți, fără să citești tot firul.
                </Text>
              )}
              {summary.isError ? (
                <Text style={[styles.machineNote, { color: c.amber }]}>
                  Sinteza nu e disponibilă acum. Încearcă din nou.
                </Text>
              ) : null}
              <Button
                title={summary.isPending ? 'Se rezumă…' : summary.data ? 'Actualizează sinteza' : 'Rezumă discuția'}
                variant="secondary"
                icon="sparkles-outline"
                onPress={() => summary.mutate()}
                disabled={summary.isPending}
              />
            </Plaque>
          ) : null}

          <View style={styles.commentsHead}>
            <Text style={[styles.commentsTitle, { color: c.textSecondary }]}>
              COMENTARII · {commentCount}
            </Text>
            <View style={[styles.rule, { backgroundColor: c.line }]} />
          </View>

          {roots.map((cm) => (
            <View key={cm.id}>
              <CommentRow comment={cm} onReply={closed ? undefined : startReply} cityId={post.author.id} />
              {cm.replies.map((r) => (
                <CommentRow key={r.id} comment={r} reply cityId={post.author.id} />
              ))}
            </View>
          ))}
          {createComment.isPending ? (
            <Text style={[styles.machineNote, { color: c.muted }]}>Se trimite…</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* POST /comments answers 409 POST_CLOSED on a closed post — so don't offer it. */}
      {closed ? (
        <View style={[styles.composer, styles.closedBar, { backgroundColor: c.surface, borderTopColor: c.line }]}>
          <Ionicons name="lock-closed-outline" size={15} color={c.textSecondary} />
          <Text style={[styles.closedText, { color: c.textSecondary }]}>
            Consultarea s-a încheiat. Comentariile sunt închise.
          </Text>
        </View>
      ) : (
      <View style={[styles.composer, { backgroundColor: c.surface, borderTopColor: c.line }]}>
        {replyTo ? (
          <View style={[styles.replyBar, { backgroundColor: c.brandWash }]}>
            <Ionicons name="return-down-forward-outline" size={14} color={c.brand} />
            <Text style={[styles.replyText, { color: c.brand }]} numberOfLines={1}>
              Răspunzi lui {replyTo.author.fullName}
            </Text>
            <Pressable onPress={() => setReplyTo(null)} hitSlop={10} accessibilityLabel="Anulează răspunsul">
              <Ionicons name="close" size={15} color={c.brand} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.composerRow}>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            returnKeyType="send"
            maxLength={2000}
            placeholder={replyTo ? 'Scrie un răspuns…' : 'Scrie un comentariu…'}
            placeholderTextColor={c.textSecondary}
            underlineColorAndroid="transparent"
            style={[
              styles.composerInput,
              { backgroundColor: c.background, color: c.text },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            ]}
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Trimite comentariul"
            style={[styles.send, { backgroundColor: c.brand, opacity: draft.trim() ? 1 : 0.4 }]}>
            <Ionicons name="send" size={17} color={c.onBrand} />
          </Pressable>
        </View>
      </View>
      )}
    </KeyboardAvoidingView>
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
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.two },
  langChip: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  langText: { fontFamily: Fonts.semibold, fontSize: 10.5, letterSpacing: 0.4 },
  machineNote: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: 2 },
  summary: { marginTop: Spacing.four, gap: Spacing.two },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryLabel: { fontFamily: Fonts.bold, fontSize: 9.5, letterSpacing: 0.9, flex: 1 },
  summaryCount: { fontFamily: Fonts.mono, fontSize: 10.5 },
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
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: 5 },
  commentActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentAction: { fontFamily: Fonts.medium, fontSize: 12 },
  // Official statement — engraved nameplate rather than another voice in the thread.
  official: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginTop: Spacing.three,
  },
  officialEdge: { width: 4 },
  officialInner: { flex: 1, padding: Spacing.three, gap: 7 },
  officialHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  officialWho: { flex: 1 },
  seal: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  officialName: { fontFamily: Fonts.bold, fontSize: 13.5, letterSpacing: -0.2 },
  officialDate: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 1 },
  officialChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  officialChipText: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 0.8, color: '#FFFFFF' },
  officialText: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 20 },
  composer: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderTopWidth: 1, gap: Spacing.two },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  closedBar: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: Spacing.three },
  closedText: { fontFamily: Fonts.medium, fontSize: 12.5 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
  },
  replyText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12 },
  composerInput: { flex: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 10, fontFamily: Fonts.regular, fontSize: 14 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
