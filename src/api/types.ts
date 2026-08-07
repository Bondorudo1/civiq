/**
 * Domain types — mirror the backend contract (API Rev 2). Data entities keep
 * their backend names (Post, Complaint); the UI displays them as Proiecte / Contact.
 * Internally camelCase; the service maps snake_case ↔ camelCase at the API boundary.
 */

export type Locale = 'ro' | 'ru';
export type UserRole = 'CITIZEN' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  locale: Locale;
  createdAt: string;
}

/** Author sub-object as returned by the API ({ id, full_name }). */
export interface Author {
  id: string;
  fullName: string;
}

export type ReactionKind = 'LIKE' | 'DISLIKE';
export type PostStatus = 'OPEN' | 'CLOSED';
/** Single filter axis for posts (API `post.type`). */
export type PostType = 'NEWS' | 'HEARING' | 'DRAFT_DECISION' | 'DISCUSSION' | 'OTHER';

/** City-authored consultation ("Proiect"). */
export interface Post {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: PostType;
  lang: Locale;
  status: PostStatus;
  verdict?: string | null;
  closedAt?: string | null;
  author: Author;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  myReaction?: ReactionKind | null;
  createdAt: string;
  /** Not in the contract — a UI-only convenience for hearings; optional. */
  deadline?: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: Author;
  text: string;
  canDelete: boolean;
  likesCount: number;
  dislikesCount: number;
  myReaction?: ReactionKind | null;
  repliesCount: number;
  replies: Comment[];
  createdAt: string;
}

export type ComplaintCategory =
  | 'ROADS'
  | 'LIGHTING'
  | 'WATER'
  | 'GARBAGE'
  | 'TRANSPORT'
  | 'LANDSCAPING'
  | 'BUILDINGS'
  | 'OTHER';

export type ComplaintStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

/** Citizen-authored complaint ("Sesizare"). */
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  address?: string | null;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  status: ComplaintStatus;
  adminResponse?: string | null;
  author: Author;
  createdAt: string;
  updatedAt: string;
}

// --- Notifications (one feed, three kinds) ---

export type NotificationKind = 'MANUAL' | 'PARSED' | 'COMPLAINT_STATUS';
export type WorkType = 'lucrari_programate' | 'intreruperi_de_manevra';

export interface OutageSegment {
  streets: string;
  timeStart: string;
  timeEnd: string;
  reason: string;
}

export interface ParsedPayload {
  workType: WorkType;
  url: string;
  segments: OutageSegment[];
}

export interface ComplaintStatusPayload {
  complaintId: string;
  complaintTitle: string;
  status: ComplaintStatus;
  adminResponse?: string | null;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  source: 'premier_energy' | null;
  /** Filled only for MANUAL; PARSED / COMPLAINT_STATUS carry `payload` instead. */
  title?: string | null;
  body?: string | null;
  payload?: ParsedPayload | ComplaintStatusPayload | null;
  eventDate?: string | null;
  isRead: boolean;
  createdAt: string;
}
