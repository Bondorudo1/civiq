import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useComments, useCreateComment, useDeleteComment, usePost } from '@/api/hooks';
import type { Comment } from '@/api/types';
import { EmptyState, LoadingView } from '@/components/ui/state-views';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminDetailText } from '@/i18n/adminDetail';
import { confirmAction } from '@/lib/confirm';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * The operator's view of a consultation thread: every comment can be removed
 * (the API lets ADMIN delete any, even on closed posts), and replies go out as
 * the city. Deliberately separate from the citizen screen — moderation powers
 * shouldn't share a surface with citizen affordances.
 */
export default function AdminDiscussionScreen() {
  const c = useTheme();
  const t = useT(adminDetailText);
  const loc = useLocale();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { data: post, isLoading } = usePost(postId);
  const { data: comments } = useComments(postId);
  const createComment = useCreateComment(postId);
  const removeComment = useDeleteComment(postId);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const bar = (title: string, count?: string) => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t.back}>
          <Ionicons name="arrow-back" size={24} color={c.onBrand} />
        </Pressable>
        <Text style={[styles.barTitle, { color: c.onBrand }]}>{title}</Text>
        {count ? <Text style={styles.barCount}>{count}</Text> : null}
      </View>
    </SafeAreaView>
  );

  if (isLoading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        {bar(t.discussionBar)}
        {isLoading ? (
          <LoadingView label={t.discussionLoading} />
        ) : (
          <EmptyState icon="alert-circle-outline" title={t.postNotFound} />
        )}
      </View>
    );
  }

  const roots = comments ?? [];
  const total = roots.reduce((n, r) => n + 1 + r.replies.length, 0);
  const closed = post.status === 'CLOSED';

  const startReply = (target: Comment) => {
    setReplyTo(target);
    inputRef.current?.focus();
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    createComment.mutate(
      { text, parentId: replyTo?.id ?? null },
      { onError: () => setError(t.sendCommentFailed) },
    );
    setDraft('');
    setReplyTo(null);
  };

  const confirmDelete = (comment: Comment, isRoot: boolean) =>
    confirmAction({
      title: t.deleteCommentTitle,
      message: isRoot && comment.replies.length > 0 ? t.deleteCommentRootBody : t.deleteCommentReplyBody,
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
      destructive: true,
      onConfirm: () =>
        removeComment.mutate(comment.id, { onError: () => setError(t.deleteCommentFailed) }),
    });

  const renderComment = (comment: Comment, isRoot: boolean) => {
    const official = comment.author.id === post.author.id;
    const date = new Date(comment.createdAt).toLocaleDateString(loc === 'ru' ? 'ru-MD' : 'ro-MD');
    return (
      <View
        key={comment.id}
        style={[
          styles.comment,
          !isRoot && styles.reply,
          official && { backgroundColor: c.brandWash, borderColor: c.brand, borderWidth: 1 },
        ]}>
        <View style={styles.commentHead}>
          <View style={[styles.avatar, { backgroundColor: official ? c.brand : c.brandWash }]}>
            {official ? (
              <Ionicons name="shield-checkmark" size={14} color={c.onBrand} />
            ) : (
              <Text style={[styles.avatarText, { color: c.brand }]}>{initials(comment.author.fullName)}</Text>
            )}
          </View>
          <View style={styles.who}>
            <Text style={[styles.author, { color: c.text }]} numberOfLines={1}>
              {comment.author.fullName}
            </Text>
            <Text style={[styles.date, { color: c.muted }]}>{date}</Text>
          </View>
          {official ? (
            <View style={[styles.chip, { backgroundColor: c.brand }]}>
              <Text style={styles.chipText}>{t.officialChip}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.text, { color: c.text }]}>{comment.text}</Text>
        <View style={styles.actions}>
          {isRoot && !closed ? (
            <Pressable onPress={() => startReply(comment)} hitSlop={8} accessibilityRole="button">
              <Text style={[styles.action, { color: c.brand }]}>{t.reply}</Text>
            </Pressable>
          ) : null}
          {/* ADMIN may remove any comment, closed post included — the API allows it. */}
          <Pressable
            onPress={() => confirmDelete(comment, isRoot)}
            hitSlop={8}
            disabled={removeComment.isPending}
            accessibilityRole="button"
            accessibilityLabel={t.deleteCommentTitle}>
            <Text style={[styles.action, { color: c.accentPressed }]}>{t.delete}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {bar(t.discussionBar, t.discussionCount(total))}

      <ScrollView
        style={styles.threadFlex}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.postTitle, { color: c.textSecondary }]} numberOfLines={2}>
          {post.title}
        </Text>

        {closed ? (
          <View style={[styles.closed, { backgroundColor: c.brandWash, borderColor: c.brand }]}>
            <Ionicons name="lock-closed-outline" size={15} color={c.brand} />
            <Text style={[styles.closedText, { color: c.brand }]}>{t.discussionClosed}</Text>
          </View>
        ) : null}

        {roots.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" title={t.discussionEmpty} />
        ) : (
          roots.map((root) => (
            <View key={root.id}>
              {renderComment(root, true)}
              {root.replies.map((r) => renderComment(r, false))}
            </View>
          ))
        )}

        {error ? <Text style={[styles.error, { color: c.accentPressed }]}>{error}</Text> : null}
      </ScrollView>

      {!closed ? (
        <View style={[styles.composer, { backgroundColor: c.surface, borderTopColor: c.line }]}>
          {replyTo ? (
            <View style={[styles.replyBar, { backgroundColor: c.brandWash }]}>
              <Ionicons name="return-down-forward-outline" size={14} color={c.brand} />
              <Text style={[styles.replyText, { color: c.brand }]} numberOfLines={1}>
                {t.replyingTo(replyTo.author.fullName)}
              </Text>
              <Pressable onPress={() => setReplyTo(null)} hitSlop={10} accessibilityLabel={t.cancel}>
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
              placeholder={t.commentPlaceholder}
              placeholderTextColor={c.textSecondary}
              underlineColorAndroid="transparent"
              style={[
                styles.input,
                { backgroundColor: c.background, color: c.text },
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
              ]}
            />
            <Pressable
              onPress={send}
              disabled={!draft.trim() || createComment.isPending}
              accessibilityRole="button"
              accessibilityLabel={t.sendComment}
              style={[
                styles.send,
                { backgroundColor: c.brandDeep, opacity: !draft.trim() || createComment.isPending ? 0.4 : 1 },
              ]}>
              <Ionicons name="send" size={17} color={c.onBrand} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2, flex: 1 },
  barCount: { fontFamily: Fonts.mono, fontSize: 12, color: '#9FD3DF' },
  threadFlex: { flex: 1 },
  thread: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  postTitle: { fontFamily: Fonts.semibold, fontSize: 13.5, lineHeight: 18 },
  closed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  closedText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  comment: { borderRadius: Radius.md, padding: Spacing.three, gap: 7, backgroundColor: 'transparent' },
  reply: { marginLeft: 26, marginTop: 2 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Fonts.bold, fontSize: 11 },
  who: { flex: 1 },
  author: { fontFamily: Fonts.semibold, fontSize: 13.5 },
  date: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 1 },
  chip: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  chipText: { fontFamily: Fonts.bold, fontSize: 8.5, letterSpacing: 0.7, color: '#FFFFFF' },
  text: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.three },
  action: { fontFamily: Fonts.semibold, fontSize: 12.5 },
  error: { fontFamily: Fonts.medium, fontSize: 12.5, textAlign: 'center' },
  composer: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderTopWidth: 1, gap: Spacing.two },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
  },
  replyText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12 },
  input: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
