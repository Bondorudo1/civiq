/**
 * Civic metadata — the enamel color-code + RO labels + signage icons for post
 * types, complaint categories/status, and outage work types. (RU labels arrive
 * with the i18n pass.) Icon names are Ionicons.
 */

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { ComplaintCategory, ComplaintStatus, PostType, WorkType } from '@/api/types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type TagMeta = { label: string; bg: string; fg: string; icon: IoniconName };

/** Post filter axis (API `post.type`). */
export const POST_TYPE: Record<PostType, TagMeta> = {
  NEWS: { label: 'Știri', bg: '#EAF6F8', fg: '#0B4F5A', icon: 'newspaper-outline' },
  HEARING: { label: 'Audiere', bg: '#E7F3EC', fg: '#205C41', icon: 'megaphone-outline' },
  DRAFT_DECISION: { label: 'Proiect de decizie', bg: '#FBEFD9', fg: '#8A5300', icon: 'document-text-outline' },
  DISCUSSION: { label: 'Discuție', bg: '#FDECEF', fg: '#8A2740', icon: 'chatbubbles-outline' },
  OTHER: { label: 'Altele', bg: '#EEF1F2', fg: '#4A5A60', icon: 'ellipsis-horizontal' },
};

type ComplaintMeta = TagMeta & { needsLocation: boolean };

export const COMPLAINT_CATEGORY: Record<ComplaintCategory, ComplaintMeta> = {
  ROADS: { label: 'Drumuri', bg: '#EAF6F8', fg: '#0B4F5A', icon: 'car-outline', needsLocation: true },
  LIGHTING: { label: 'Iluminat', bg: '#FBEFD9', fg: '#8A5300', icon: 'bulb-outline', needsLocation: true },
  WATER: { label: 'Apă', bg: '#EAF6F8', fg: '#0B4F5A', icon: 'water-outline', needsLocation: true },
  GARBAGE: { label: 'Salubrizare', bg: '#E7F3EC', fg: '#205C41', icon: 'trash-outline', needsLocation: true },
  TRANSPORT: { label: 'Transport', bg: '#EAF6F8', fg: '#0B4F5A', icon: 'bus-outline', needsLocation: false },
  LANDSCAPING: { label: 'Amenajare', bg: '#E7F3EC', fg: '#205C41', icon: 'leaf-outline', needsLocation: true },
  BUILDINGS: { label: 'Clădiri', bg: '#EAF6F8', fg: '#0B4F5A', icon: 'business-outline', needsLocation: true },
  OTHER: { label: 'Altele', bg: '#EEF1F2', fg: '#4A5A60', icon: 'ellipsis-horizontal', needsLocation: false },
};

export const COMPLAINT_STATUS: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  NEW: { label: 'Nou', color: '#0E7490', bg: '#EAF6F8' },
  IN_PROGRESS: { label: 'În lucru', color: '#8A5300', bg: '#FBEFD9' },
  RESOLVED: { label: 'Rezolvat', color: '#205C41', bg: '#E7F3EC' },
  REJECTED: { label: 'Respins', color: '#B23A32', bg: '#FBE9E7' },
};

/** Premier Energy outage work types (for composing PARSED notification titles). */
export const WORK_TYPE: Record<WorkType, string> = {
  lucrari_programate: 'Lucrări programate',
  intreruperi_de_manevra: 'Întreruperi de manevră',
};
