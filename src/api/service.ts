/**
 * Data-access service. Currently backed by mock data; when the backend is ready
 * (API Rev 2 at http://localhost:8000/api) flip USE_MOCK to false and implement
 * the real fetch calls behind the same function signatures + snake_case mapping.
 */

import { mockComments, mockComplaints, mockNotifications, mockPosts, mockUser } from './mock-data';
import type { Comment, Complaint, Notification, Post, User } from './types';

export const USE_MOCK = true;

const delay = <T>(data: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const api = {
  getMe: (): Promise<User> => delay(mockUser),
  getPosts: (): Promise<Post[]> => delay(mockPosts),
  getPost: (id: string): Promise<Post | undefined> => delay(mockPosts.find((p) => p.id === id)),
  /** Root comments with nested one-level replies (API returns replies inline). */
  getComments: (postId: string): Promise<Comment[]> => delay(mockComments[postId] ?? []),
  getComplaints: (): Promise<Complaint[]> => delay(mockComplaints),
  getComplaint: (id: string): Promise<Complaint | undefined> =>
    delay(mockComplaints.find((c) => c.id === id)),
  getNotifications: (): Promise<Notification[]> => delay(mockNotifications),
  getUnreadCount: (): Promise<number> => delay(mockNotifications.filter((n) => !n.isRead).length),
};
