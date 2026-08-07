/**
 * React Query hooks over the service layer. Screens consume these; when the
 * real API lands, only service.ts changes.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './service';
import type {
  AiLanguage,
  ComplaintCategory,
  ComplaintStatus,
  Locale,
  PostType,
  ReactionKind,
} from './types';

export const useMe = () => useQuery({ queryKey: ['me'], queryFn: api.getMe });

export const usePosts = () => useQuery({ queryKey: ['posts'], queryFn: api.getPosts });

export const usePost = (id: string) =>
  useQuery({ queryKey: ['post', id], queryFn: () => api.getPost(id), enabled: !!id });

export const useComments = (postId: string) =>
  useQuery({ queryKey: ['comments', postId], queryFn: () => api.getComments(postId), enabled: !!postId });

export const useComplaints = () =>
  useQuery({ queryKey: ['complaints'], queryFn: api.getComplaints });

export const useComplaint = (id: string) =>
  useQuery({ queryKey: ['complaint', id], queryFn: () => api.getComplaint(id), enabled: !!id });

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: api.getNotifications });

export const useUnreadCount = () =>
  useQuery({ queryKey: ['notifications', 'unread'], queryFn: api.getUnreadCount });

/** Invalidating ['notifications'] also refreshes the unread badge (prefix match). */
export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// --- Auth. The screens hand the token + role straight to the auth store. ---

export const useLogin = () =>
  useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
  });

export const useRegister = () => useMutation({ mutationFn: api.register });

// --- Mutations ---

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateMe,
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
};

export const useCreateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createComplaint,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
  });
};

export const useCreateComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string | null }) =>
      api.createComment(postId, text, parentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteComment(postId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};

export const useReactToPost = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: ReactionKind | null) => api.reactToPost(postId, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useReactToComment = (postId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: ReactionKind | null }) =>
      api.reactToComment(postId, id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });
};

// --- AI. Each can fail with 503 AI_UNAVAILABLE; screens keep the button live. ---

export const useTranslatePost = (postId: string) =>
  useMutation({ mutationFn: (language: AiLanguage) => api.translatePost(postId, language) });

export const useCommentsSummary = (postId: string) =>
  useMutation({ mutationFn: () => api.commentsSummary(postId) });

export const useSpellcheck = () => useMutation({ mutationFn: api.spellcheck });

export const useAskCity = () => useMutation({ mutationFn: api.askCity });

// --- Admin. Every mutation refreshes the queue it touches. ---

export const useAdminComplaints = (filters?: {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
}) =>
  useQuery({
    queryKey: ['admin', 'complaints', filters ?? {}],
    queryFn: () => api.adminComplaints(filters),
  });

export const useAdminUpdateComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; status?: ComplaintStatus; adminResponse?: string }) =>
      api.adminUpdateComplaint(id, patch),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['admin', 'complaints'] });
      qc.invalidateQueries({ queryKey: ['complaints'] });
      qc.invalidateQueries({ queryKey: ['complaint', updated.id] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

const invalidatePosts = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['posts'] });
  qc.invalidateQueries({ queryKey: ['post'] });
};

export const useAdminCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.adminCreatePost, onSuccess: () => invalidatePosts(qc) });
};

export const useAdminUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; title?: string; body?: string; type?: PostType; lang?: Locale }) =>
      api.adminUpdatePost(id, patch),
    onSuccess: () => invalidatePosts(qc),
  });
};

export const useAdminDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.adminDeletePost, onSuccess: () => invalidatePosts(qc) });
};

export const useAdminClosePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verdict }: { id: string; verdict: string }) => api.adminClosePost(id, verdict),
    onSuccess: () => invalidatePosts(qc),
  });
};

export const useAdminReopenPost = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.adminReopenPost, onSuccess: () => invalidatePosts(qc) });
};

export const useAdminNotifications = () =>
  useQuery({ queryKey: ['admin', 'notifications'], queryFn: api.adminNotifications });

const invalidateNotifications = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['admin', 'notifications'] });
  qc.invalidateQueries({ queryKey: ['notifications'] });
};

export const useAdminCreateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.adminCreateNotification,
    onSuccess: () => invalidateNotifications(qc),
  });
};

export const useAdminUpdateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; title?: string; body?: string; eventDate?: string | null }) =>
      api.adminUpdateNotification(id, patch),
    onSuccess: () => invalidateNotifications(qc),
  });
};

export const useAdminDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.adminDeleteNotification,
    onSuccess: () => invalidateNotifications(qc),
  });
};
