/**
 * Real API Rev 3 implementation. Mirrors mockApi's signatures exactly, so
 * service.ts can swap between them without a single screen changing.
 *
 * Endpoint paths, validation and status codes follow the contract; anything the
 * contract doesn't return (registry numbers, author roles) is derived in the UI.
 */

import { get, items, PAGE_SIZE, send, sendForm, type Page } from './client';
import type {
  AiLanguage,
  AskAnswer,
  AuthResponse,
  Comment,
  CommentsSummary,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Locale,
  Notification,
  Post,
  PostType,
  ReactionKind,
  ReactionResult,
  Translation,
  User,
  VerificationRequest,
} from './types';

export const liveApi = {
  // --- Auth ---
  login: (email: string, password: string): Promise<AuthResponse> =>
    send('POST', '/auth/login', { email, password }),

  register: (input: {
    email: string;
    password: string;
    fullName: string;
    locale?: Locale;
  }): Promise<AuthResponse> => send('POST', '/auth/register', input),

  getMe: (): Promise<User> => get('/me'),

  /** Pending backend work — these three don't exist in Rev 3 yet. */
  requestVerification: (input: { idnp: string; address: string }): Promise<User> =>
    send('POST', '/me/verification', input),

  adminVerifications: (): Promise<VerificationRequest[]> =>
    get<Page<VerificationRequest>>('/admin/verifications', { size: PAGE_SIZE }).then(items),

  adminDecideVerification: (
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    reason?: string,
  ): Promise<VerificationRequest> => send('PATCH', `/admin/verifications/${id}`, { status, reason }),

  updateMe: (patch: { fullName?: string; locale?: Locale }): Promise<User> =>
    send('PATCH', '/me', patch),

  // --- Posts ---
  getPosts: (): Promise<Post[]> =>
    get<Page<Post>>('/posts', { size: PAGE_SIZE }).then(items),

  getPost: (id: string): Promise<Post | undefined> => get(`/posts/${id}`),

  getComments: (postId: string): Promise<Comment[]> =>
    get<Page<Comment>>(`/posts/${postId}/comments`, { size: PAGE_SIZE }).then(items),

  createComment: (postId: string, text: string, parentId?: string | null): Promise<Comment> =>
    send('POST', `/posts/${postId}/comments`, { text, parentId: parentId ?? null }),

  /** postId is only used for cache invalidation; the endpoint takes the comment id. */
  deleteComment: (_postId: string, id: string): Promise<void> => send('DELETE', `/comments/${id}`),

  reactToPost: (id: string, value: ReactionKind | null): Promise<ReactionResult> =>
    send('POST', `/posts/${id}/react`, { value }),

  reactToComment: (_postId: string, id: string, value: ReactionKind | null): Promise<ReactionResult> =>
    send('POST', `/comments/${id}/react`, { value }),

  // --- Complaints ---
  getComplaints: (): Promise<Complaint[]> =>
    get<Page<Complaint>>('/me/complaints', { size: PAGE_SIZE }).then(items),

  getComplaint: (id: string): Promise<Complaint | undefined> => get(`/complaints/${id}`),

  /** multipart because of the photo; lat and lng must travel together or not at all. */
  createComplaint: (input: {
    title: string;
    description: string;
    category: ComplaintCategory;
    address?: string | null;
    photoUrl?: string | null;
  }): Promise<Complaint> =>
    sendForm(
      'POST',
      '/complaints',
      {
        title: input.title,
        description: input.description,
        category: input.category,
        address: input.address,
      },
      input.photoUrl ? { field: 'photo', uri: input.photoUrl } : null,
    ),

  // --- Notifications ---
  getNotifications: (): Promise<Notification[]> =>
    get<Page<Notification>>('/notifications', { size: PAGE_SIZE }).then(items),

  getUnreadCount: (): Promise<number> =>
    get<{ count: number }>('/notifications/unread-count').then((r) => r.count),

  markNotificationRead: (id: string): Promise<void> =>
    send('POST', `/notifications/${id}/read`),

  markAllNotificationsRead: (): Promise<number> =>
    send<{ marked: number }>('POST', '/notifications/read-all').then((r) => r.marked),

  // --- AI. Synchronous against an LLM: 60s timeout, 503 when the container is down. ---
  translatePost: (id: string, language: AiLanguage): Promise<Translation> =>
    send('POST', `/posts/${id}/translate`, { language }),

  commentsSummary: (id: string): Promise<CommentsSummary> =>
    send('POST', `/posts/${id}/comments/summary`),

  spellcheck: (text: string): Promise<string> =>
    send<{ correctedText: string }>('POST', '/ai/spellcheck', { text }).then((r) => r.correctedText),

  askCity: (question: string): Promise<AskAnswer> => send('POST', '/ai/ask', { question }),

  // --- Admin ---
  adminComplaints: (filters?: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
  }): Promise<Complaint[]> =>
    get<Page<Complaint>>('/admin/complaints', {
      size: PAGE_SIZE,
      status: filters?.status,
      category: filters?.category,
    }).then(items),

  adminUpdateComplaint: (
    id: string,
    patch: { status?: ComplaintStatus; adminResponse?: string },
  ): Promise<Complaint> => send('PATCH', `/admin/complaints/${id}`, patch),

  adminCreatePost: (input: {
    title: string;
    body: string;
    type: PostType;
    lang?: Locale;
    imageUrl?: string | null;
  }): Promise<Post> =>
    sendForm(
      'POST',
      '/admin/posts',
      { title: input.title, body: input.body, type: input.type, lang: input.lang },
      input.imageUrl ? { field: 'image', uri: input.imageUrl } : null,
    ),

  adminUpdatePost: (
    id: string,
    patch: { title?: string; body?: string; type?: PostType; lang?: Locale },
  ): Promise<Post> => sendForm('PATCH', `/admin/posts/${id}`, patch),

  adminDeletePost: (id: string): Promise<void> => send('DELETE', `/admin/posts/${id}`),

  adminClosePost: (id: string, verdict: string): Promise<Post> =>
    send('POST', `/admin/posts/${id}/close`, { verdict }),

  adminReopenPost: (id: string): Promise<Post> => send('POST', `/admin/posts/${id}/reopen`),

  adminNotifications: (): Promise<Notification[]> =>
    get<Page<Notification>>('/admin/notifications', { size: PAGE_SIZE }).then(items),

  adminCreateNotification: (input: {
    title: string;
    body: string;
    eventDate?: string | null;
  }): Promise<Notification> => send('POST', '/admin/notifications', input),

  adminUpdateNotification: (
    id: string,
    patch: { title?: string; body?: string; eventDate?: string | null },
  ): Promise<Notification> => send('PATCH', `/admin/notifications/${id}`, patch),

  adminDeleteNotification: (id: string): Promise<void> =>
    send('DELETE', `/admin/notifications/${id}`),
};
