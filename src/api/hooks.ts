/**
 * React Query hooks over the service layer. Screens consume these; when the
 * real API lands, only service.ts changes.
 */

import { useQuery } from '@tanstack/react-query';

import { api } from './service';

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
