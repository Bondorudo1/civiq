/**
 * Data-access service. Currently backed by mock data; when the backend is ready
 * (API Rev 2 at http://localhost:8000/api) flip USE_MOCK to false and implement
 * the real fetch calls behind the same function signatures + snake_case mapping.
 */

import { liveApi } from './live';
import {
  mockAdmin,
  mockComments,
  mockComplaints,
  mockNotifications,
  mockPosts,
  mockUser,
  mockVerifications,
} from './mock-data';
import type {
  AiLanguage,
  AskAnswer,
  AuthResponse,
  ChatReply,
  Comment,
  Complaint,
  CommentsSummary,
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
  UserRole,
  VerificationRequest,
} from './types';

export const USE_MOCK = true;

const delay = <T>(data: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/** AI calls are synchronous against an LLM — slow enough that the UI must show a spinner. */
const aiDelay = <T>(data: T): Promise<T> => delay(data, 1400);

/**
 * Which mock identity /me answers with. The real API derives this from the bearer
 * token; here the auth store sets it at sign-in.
 */
let activeRole: UserRole = 'CITIZEN';
export const setMockRole = (role: UserRole) => {
  activeRole = role;
};

/** Stands in for the server's UUIDs until the real API issues them. */
const newId = (): string =>
  `${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}`;

/** Toggle semantics of POST /react: same value clears, different value switches. */
function nextReaction(current: ReactionKind | null, value: ReactionKind | null): ReactionKind | null {
  if (value === null) return null;
  return current === value ? null : value;
}

const mockApi = {
  /** Mirrors POST /auth/login: any password passes, the email picks the role. */
  login: (email: string, _password: string): Promise<AuthResponse> => {
    const user = /admin|prim[aă]ri/i.test(email) ? mockAdmin : mockUser;
    return delay({ accessToken: 'dev-token', tokenType: 'bearer', expiresIn: 604800, user }, 400);
  },

  register: (input: {
    email: string;
    password: string;
    fullName: string;
    locale?: Locale;
  }): Promise<AuthResponse> => {
    mockUser.fullName = input.fullName;
    mockUser.email = input.email;
    if (input.locale) mockUser.locale = input.locale;
    return delay(
      { accessToken: 'dev-token', tokenType: 'bearer', expiresIn: 604800, user: { ...mockUser } },
      400,
    );
  },

  getMe: (): Promise<User> => delay(activeRole === 'ADMIN' ? mockAdmin : mockUser),
  getPosts: (): Promise<Post[]> => delay(mockPosts),
  getPost: (id: string): Promise<Post | undefined> => delay(mockPosts.find((p) => p.id === id)),
  /** Root comments with nested one-level replies (API returns replies inline). */
  getComments: (postId: string): Promise<Comment[]> => delay(mockComments[postId] ?? []),
  getComplaints: (): Promise<Complaint[]> => delay(mockComplaints),
  getComplaint: (id: string): Promise<Complaint | undefined> =>
    delay(mockComplaints.find((c) => c.id === id)),
  getNotifications: (): Promise<Notification[]> => delay(mockNotifications),
  getUnreadCount: (): Promise<number> => delay(mockNotifications.filter((n) => !n.isRead).length),
  /** Real API: POST /notifications/:id/read → 204, idempotent. */
  markNotificationRead: (id: string): Promise<void> => {
    const n = mockNotifications.find((x) => x.id === id);
    if (n) n.isRead = true;
    return delay(undefined, 120);
  },
  /** Real API: POST /notifications/read-all → { marked }. */
  markAllNotificationsRead: (): Promise<number> => {
    const unread = mockNotifications.filter((n) => !n.isRead);
    unread.forEach((n) => (n.isRead = true));
    return delay(unread.length, 150);
  },

  /**
   * Demonstration only — no verification endpoint in API Rev 3 yet.
   * Submitting only reaches PENDING; participation stays locked until an operator
   * approves the request from the admin panel.
   */
  requestVerification: (input: { idnp: string; address: string }): Promise<User> => {
    if (!/^\d{13}$/.test(input.idnp)) {
      return Promise.reject({
        code: 'VALIDATION_ERROR',
        message: 'IDNP invalid.',
        fields: { idnp: 'IDNP-ul are exact 13 cifre.' },
      });
    }
    mockUser.verification = 'PENDING';
    const existing = mockVerifications.find((v) => v.user.id === mockUser.id);
    if (existing) {
      Object.assign(existing, { ...input, status: 'PENDING', reason: null });
    } else {
      mockVerifications.unshift({
        id: newId(),
        user: { id: mockUser.id, fullName: mockUser.fullName },
        idnp: input.idnp,
        address: input.address,
        status: 'PENDING',
        reason: null,
        createdAt: new Date().toISOString(),
      });
    }
    return delay({ ...mockUser }, 900);
  },

  /** GET /admin/verifications — the review queue, newest first. */
  adminVerifications: (): Promise<VerificationRequest[]> => delay([...mockVerifications]),

  /**
   * PATCH /admin/verifications/{id}. Approving is what actually unlocks
   * participation, so the resident is told either way via the notification feed.
   */
  adminDecideVerification: (
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    reason?: string,
  ): Promise<VerificationRequest> => {
    const idx = mockVerifications.findIndex((v) => v.id === id);
    if (idx < 0) return Promise.reject({ code: 'NOT_FOUND', message: 'Cererea nu există.' });
    const target = mockVerifications[idx];
    if (status === 'REJECTED' && !reason?.trim()) {
      return Promise.reject({
        code: 'VALIDATION_ERROR',
        message: 'Motivul este obligatoriu la respingere.',
        fields: { reason: 'Explică de ce cererea a fost respinsă.' },
      });
    }
    // Replace the element with a new object (don't mutate in place): React Query's
    // structural sharing only re-renders the still-mounted queue on a changed ref.
    const updated = { ...target, status, reason: reason?.trim() || null };
    mockVerifications[idx] = updated;
    if (target.user.id === mockUser.id) mockUser.verification = status;

    mockNotifications.unshift({
      id: newId(),
      kind: 'MANUAL',
      source: null,
      title: status === 'VERIFIED' ? 'Contul tău a fost verificat' : 'Cererea de verificare a fost respinsă',
      body:
        status === 'VERIFIED'
          ? 'Poți acum să comentezi, să reacționezi și să depui sesizări.'
          : (updated.reason ?? 'Verifică datele introduse și încearcă din nou.'),
      payload: null,
      eventDate: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    return delay(updated, 350);
  },

  /** PATCH /api/me — both fields optional. */
  updateMe: (patch: { fullName?: string; locale?: Locale }): Promise<User> => {
    Object.assign(mockUser, patch);
    return delay({ ...mockUser }, 300);
  },

  /** POST /api/complaints (multipart) → 201 Complaint. */
  createComplaint: (input: {
    title: string;
    description: string;
    category: ComplaintCategory;
    address?: string | null;
    photoUrl?: string | null;
  }): Promise<Complaint> => {
    const now = new Date().toISOString();
    const created: Complaint = {
      id: newId(),
      title: input.title,
      description: input.description,
      category: input.category,
      address: input.address ?? null,
      lat: null,
      lng: null,
      photoUrl: input.photoUrl ?? null,
      status: 'NEW',
      adminResponse: null,
      author: { id: mockUser.id, fullName: mockUser.fullName },
      createdAt: now,
      updatedAt: now,
    };
    mockComplaints.unshift(created);
    return delay(created, 400);
  },

  /** POST /api/posts/{id}/comments → 201 Comment. Replies to replies re-parent to the root. */
  createComment: (postId: string, text: string, parentId?: string | null): Promise<Comment> => {
    const roots = mockComments[postId] ?? (mockComments[postId] = []);
    const parent = parentId ? roots.find((r) => r.id === parentId || r.replies.some((x) => x.id === parentId)) : null;
    const created: Comment = {
      id: newId(),
      postId,
      parentId: parent?.id ?? null,
      author: { id: mockUser.id, fullName: mockUser.fullName },
      text,
      canDelete: true,
      likesCount: 0,
      dislikesCount: 0,
      myReaction: null,
      repliesCount: 0,
      replies: [],
      createdAt: new Date().toISOString(),
    };
    if (parent) {
      parent.replies.push(created);
      parent.repliesCount += 1;
    } else {
      roots.push(created);
    }
    const post = mockPosts.find((p) => p.id === postId);
    if (post) post.commentsCount += 1;
    return delay(created, 350);
  },

  /** DELETE /api/comments/{id} → 204. Deleting a root deletes its replies. */
  deleteComment: (postId: string, id: string): Promise<void> => {
    const roots = mockComments[postId] ?? [];
    const post = mockPosts.find((p) => p.id === postId);
    const rootIndex = roots.findIndex((r) => r.id === id);
    if (rootIndex >= 0) {
      const [removed] = roots.splice(rootIndex, 1);
      if (post) post.commentsCount -= 1 + removed.replies.length;
    } else {
      for (const root of roots) {
        const i = root.replies.findIndex((r) => r.id === id);
        if (i >= 0) {
          root.replies.splice(i, 1);
          root.repliesCount -= 1;
          if (post) post.commentsCount -= 1;
          break;
        }
      }
    }
    return delay(undefined, 250);
  },

  /** POST /api/posts/{id}/react — works on closed posts too. */
  reactToPost: (id: string, value: ReactionKind | null): Promise<ReactionResult> => {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return delay({ myReaction: null, likesCount: 0, dislikesCount: 0 }, 200);
    const before = post.myReaction ?? null;
    const after = nextReaction(before, value);
    if (before === 'LIKE') post.likesCount -= 1;
    if (before === 'DISLIKE') post.dislikesCount -= 1;
    if (after === 'LIKE') post.likesCount += 1;
    if (after === 'DISLIKE') post.dislikesCount += 1;
    post.myReaction = after;
    return delay(
      { myReaction: after, likesCount: post.likesCount, dislikesCount: post.dislikesCount },
      200,
    );
  },

  /** POST /api/comments/{id}/react — same body and behaviour as the post reaction. */
  reactToComment: (postId: string, id: string, value: ReactionKind | null): Promise<ReactionResult> => {
    const all = (mockComments[postId] ?? []).flatMap((r) => [r, ...r.replies]);
    const target = all.find((x) => x.id === id);
    if (!target) return delay({ myReaction: null, likesCount: 0, dislikesCount: 0 }, 200);
    const before = target.myReaction ?? null;
    const after = nextReaction(before, value);
    if (before === 'LIKE') target.likesCount -= 1;
    if (before === 'DISLIKE') target.dislikesCount -= 1;
    if (after === 'LIKE') target.likesCount += 1;
    if (after === 'DISLIKE') target.dislikesCount += 1;
    target.myReaction = after;
    return delay(
      { myReaction: after, likesCount: target.likesCount, dislikesCount: target.dislikesCount },
      200,
    );
  },

  // --- AI service ---

  /** POST /api/posts/{id}/translate. Same language as the original is free and cached. */
  translatePost: (id: string, language: AiLanguage): Promise<Translation> => {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return aiDelay({ language, title: '', body: '', cached: true });
    if (post.lang === language) {
      return delay({ language, title: post.title, body: post.body, cached: true }, 120);
    }
    return aiDelay({
      language,
      title: `[${language.toUpperCase()}] ${post.title}`,
      body: `[${language.toUpperCase()}] ${post.body}`,
      cached: false,
    });
  },

  /** POST /api/posts/{id}/comments/summary. Throws NOT_ENOUGH_COMMENTS below two. */
  commentsSummary: (id: string): Promise<CommentsSummary> => {
    const roots = mockComments[id] ?? [];
    const basedOn = roots.reduce((n, r) => n + 1 + r.replies.length, 0);
    if (basedOn < 2) {
      return Promise.reject({ code: 'NOT_ENOUGH_COMMENTS', message: 'Prea puține comentarii.' });
    }
    return aiDelay({
      summary:
        'Majoritatea participanților susțin traseul nou, în special pentru acoperirea zonei gării. ' +
        'Două propuneri cer păstrarea curselor de dimineață devreme, iar una vizează stația de lângă piață. ' +
        'Nu au fost obiecții privind costurile.',
      basedOn,
      cached: false,
    });
  },

  /** POST /api/ai/spellcheck — pure string processing, nothing stored. */
  spellcheck: (text: string): Promise<string> =>
    aiDelay(text.trim().replace(/\s+/g, ' ').replace(/^([a-zăâîșț])/, (m) => m.toUpperCase())),

  // --- Admin (role ADMIN) ---

  /** GET /api/admin/complaints — the whole queue, newest first. */
  adminComplaints: (filters?: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
  }): Promise<Complaint[]> =>
    delay(
      mockComplaints.filter(
        (x) =>
          (!filters?.status || x.status === filters.status) &&
          (!filters?.category || x.category === filters.category),
      ),
    ),

  /**
   * PATCH /api/admin/complaints/{id}. When `status` actually changes, the backend
   * also creates a COMPLAINT_STATUS notification for the author — mirrored here so
   * the citizen side of the demo reacts.
   */
  adminUpdateComplaint: (
    id: string,
    patch: { status?: ComplaintStatus; adminResponse?: string },
  ): Promise<Complaint> => {
    const target = mockComplaints.find((x) => x.id === id);
    if (!target) return Promise.reject({ code: 'NOT_FOUND', message: 'Sesizarea nu există.' });

    const statusChanged = !!patch.status && patch.status !== target.status;
    if (statusChanged && (patch.status === 'RESOLVED' || patch.status === 'REJECTED')) {
      const text = patch.adminResponse?.trim() ?? '';
      if (text.length < 4 || text.length > 2000) {
        return Promise.reject({
          code: 'VALIDATION_ERROR',
          message: 'Explicația este obligatorie la închiderea sesizării.',
          fields: { adminResponse: 'Între 4 și 2000 de caractere.' },
        });
      }
    }

    if (patch.adminResponse !== undefined) target.adminResponse = patch.adminResponse;
    if (patch.status) target.status = patch.status;
    target.updatedAt = new Date().toISOString();

    if (statusChanged) {
      mockNotifications.unshift({
        id: newId(),
        kind: 'COMPLAINT_STATUS',
        source: null,
        title: null,
        body: null,
        payload: {
          complaintId: target.id,
          complaintTitle: target.title,
          status: target.status,
          adminResponse: target.adminResponse ?? null,
        },
        eventDate: null,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
    return delay({ ...target }, 350);
  },

  /** POST /api/admin/posts (multipart) — always created OPEN. */
  adminCreatePost: (input: {
    title: string;
    body: string;
    type: PostType;
    lang?: Locale;
    imageUrl?: string | null;
  }): Promise<Post> => {
    const created: Post = {
      id: newId(),
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl ?? undefined,
      type: input.type,
      lang: input.lang ?? 'ro',
      status: 'OPEN',
      verdict: null,
      closedAt: null,
      author: { id: 'city', fullName: 'Primăria Cahul' },
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      myReaction: null,
      createdAt: new Date().toISOString(),
    };
    mockPosts.unshift(created);
    return delay(created, 400);
  },

  /** PATCH /api/admin/posts/{id} — every field optional; closed posts are editable. */
  adminUpdatePost: (
    id: string,
    patch: { title?: string; body?: string; type?: PostType; lang?: Locale },
  ): Promise<Post> => {
    const target = mockPosts.find((p) => p.id === id);
    if (!target) return Promise.reject({ code: 'NOT_FOUND', message: 'Proiectul nu există.' });
    Object.assign(target, patch);
    return delay({ ...target }, 350);
  },

  /** DELETE /api/admin/posts/{id} — takes comments and reactions with it. */
  adminDeletePost: (id: string): Promise<void> => {
    const i = mockPosts.findIndex((p) => p.id === id);
    if (i >= 0) mockPosts.splice(i, 1);
    delete mockComments[id];
    return delay(undefined, 300);
  },

  /** POST /api/admin/posts/{id}/close — verdict 10–5000 required. */
  adminClosePost: (id: string, verdict: string): Promise<Post> => {
    const target = mockPosts.find((p) => p.id === id);
    if (!target) return Promise.reject({ code: 'NOT_FOUND', message: 'Proiectul nu există.' });
    if (target.status === 'CLOSED') {
      return Promise.reject({ code: 'POST_ALREADY_CLOSED', message: 'Proiectul este deja închis.' });
    }
    const text = verdict.trim();
    if (text.length < 10 || text.length > 5000) {
      return Promise.reject({
        code: 'VALIDATION_ERROR',
        message: 'Verdictul este obligatoriu.',
        fields: { verdict: 'Între 10 și 5000 de caractere.' },
      });
    }
    target.status = 'CLOSED';
    target.verdict = text;
    target.closedAt = new Date().toISOString();
    return delay({ ...target }, 350);
  },

  /** POST /api/admin/posts/{id}/reopen — clears the verdict; history isn't kept. */
  adminReopenPost: (id: string): Promise<Post> => {
    const target = mockPosts.find((p) => p.id === id);
    if (!target) return Promise.reject({ code: 'NOT_FOUND', message: 'Proiectul nu există.' });
    if (target.status === 'OPEN') {
      return Promise.reject({ code: 'POST_ALREADY_OPEN', message: 'Proiectul este deja deschis.' });
    }
    target.status = 'OPEN';
    target.verdict = null;
    target.closedAt = null;
    return delay({ ...target }, 300);
  },

  /** GET /api/admin/notifications — personal COMPLAINT_STATUS ones never appear here. */
  adminNotifications: (): Promise<Notification[]> =>
    delay(mockNotifications.filter((n) => n.kind !== 'COMPLAINT_STATUS')),

  /** POST /api/admin/notifications — broadcast to every resident; kind is always MANUAL. */
  adminCreateNotification: (input: {
    title: string;
    body: string;
    eventDate?: string | null;
  }): Promise<Notification> => {
    const created: Notification = {
      id: newId(),
      kind: 'MANUAL',
      source: null,
      title: input.title,
      body: input.body,
      payload: null,
      eventDate: input.eventDate ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    mockNotifications.unshift(created);
    return delay(created, 350);
  },

  /** PATCH /api/admin/notifications/{id} — MANUAL only. */
  adminUpdateNotification: (
    id: string,
    patch: { title?: string; body?: string; eventDate?: string | null },
  ): Promise<Notification> => {
    const target = mockNotifications.find((n) => n.id === id);
    if (!target) return Promise.reject({ code: 'NOT_FOUND', message: 'Anunțul nu există.' });
    if (target.kind !== 'MANUAL') {
      return Promise.reject({
        code: 'NOTIFICATION_NOT_EDITABLE',
        message: 'Doar anunțurile primăriei pot fi editate.',
      });
    }
    Object.assign(target, patch);
    return delay({ ...target }, 300);
  },

  /** DELETE /api/admin/notifications/{id} — MANUAL and PARSED (bad parses happen). */
  adminDeleteNotification: (id: string): Promise<void> => {
    const i = mockNotifications.findIndex((n) => n.id === id);
    if (i >= 0) mockNotifications.splice(i, 1);
    return delay(undefined, 250);
  },

  /** POST /api/ai/ask — no history; each question stands alone. */
  askCity: (question: string): Promise<AskAnswer> =>
    aiDelay({
      explain:
        `Pentru „${question.trim()}” — primăria Cahul primește cererile la ghișeul unic, ` +
        'în zilele lucrătoare între 8:00 și 16:00. Termenul standard de răspuns este de 30 de zile ' +
        'calendaristice de la înregistrare. Pentru majoritatea solicitărilor sunt necesare actul de ' +
        'identitate și cererea tip, care poate fi completată la fața locului.',
      links: ['https://cahul.md/reglementari', 'https://cahul.md/formulare'],
    }),

  /** Multi-turn chat. The mock echoes the last question so the shell is testable. */
  chatWithBot: (messages: { role: 'user' | 'assistant'; content: string }[]): Promise<ChatReply> => {
    const last = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    return aiDelay({
      answer:
        `(răspuns simulat) Despre „${last.trim()}” — asistentul real caută în regulamentele, ` +
        'formularele și hotărârile primăriei Cahul. Pornește serviciul AI și setează ' +
        'EXPO_PUBLIC_AI_LIVE=true ca să vezi răspunsul adevărat.',
      links: ['https://cahul.md/reglementari'],
    });
  },
};

/**
 * The AI service runs in its own container, so it can be live while the rest is
 * still mocked. `EXPO_PUBLIC_AI_LIVE=true` sends translate / summary / spellcheck
 * / ask to the real backend without standing up the whole API.
 */
export const AI_LIVE = process.env.EXPO_PUBLIC_AI_LIVE === 'true';

const liveAi = {
  translatePost: liveApi.translatePost,
  commentsSummary: liveApi.commentsSummary,
  spellcheck: liveApi.spellcheck,
  askCity: liveApi.askCity,
  /**
   * There is no /ai/chat endpoint yet, so a chat turn becomes one stateless
   * /ai/ask call — which is exactly what that endpoint is specified to be.
   * Swap to `liveApi.chatWithBot` once the RAG service exposes history.
   */
  chatWithBot: (messages: { role: 'user' | 'assistant'; content: string }[]): Promise<ChatReply> => {
    const last = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    return liveApi.askCity(last).then((a) => ({ answer: a.explain, links: a.links }));
  },
};

/**
 * The single swap point. `liveApi` is typed against `mockApi`, so if the real
 * implementation ever drifts from what the screens call, this line fails to compile.
 */
export const api: typeof mockApi = USE_MOCK
  ? AI_LIVE
    ? { ...mockApi, ...liveAi }
    : mockApi
  : liveApi;
