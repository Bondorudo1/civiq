/**
 * Civic metadata — the enamel colour-code, bilingual labels and signage icons for
 * post types, complaint categories/status, and outage work types.
 *
 * Labels are `{ ro, ru }` pairs rather than plain strings: they appear inside
 * loops and `.map()`s, so a screen reads the current language once
 * (`const loc = useLocale()`) and indexes — no hook per row. Icon names are Ionicons.
 */

import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { ComplaintCategory, ComplaintStatus, PostType, WorkType } from '@/api/types';
import type { Slice } from '@/i18n';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
/** A label in both languages; index it with the value from `useLocale()`. */
export type Label = Slice<string>;
type TagMeta = { label: Label; bg: string; fg: string; icon: IoniconName };

/** Post filter axis (API `post.type`). */
export const POST_TYPE: Record<PostType, TagMeta> = {
  NEWS: { label: { ro: 'Știri', ru: 'Новости' }, bg: '#EAF6F8', fg: '#0B4F5A', icon: 'newspaper-outline' },
  HEARING: { label: { ro: 'Audiere', ru: 'Слушания' }, bg: '#E7F3EC', fg: '#205C41', icon: 'megaphone-outline' },
  DRAFT_DECISION: {
    label: { ro: 'Proiect de decizie', ru: 'Проект решения' },
    bg: '#FBEFD9',
    fg: '#8A5300',
    icon: 'document-text-outline',
  },
  DISCUSSION: { label: { ro: 'Discuție', ru: 'Обсуждение' }, bg: '#FDECEF', fg: '#8A2740', icon: 'chatbubbles-outline' },
  OTHER: { label: { ro: 'Altele', ru: 'Другое' }, bg: '#EEF1F2', fg: '#4A5A60', icon: 'ellipsis-horizontal' },
};

type ComplaintMeta = TagMeta & { needsLocation: boolean };

export const COMPLAINT_CATEGORY: Record<ComplaintCategory, ComplaintMeta> = {
  ROADS: { label: { ro: 'Drumuri', ru: 'Дороги' }, bg: '#EAF6F8', fg: '#0B4F5A', icon: 'car-outline', needsLocation: true },
  LIGHTING: { label: { ro: 'Iluminat', ru: 'Освещение' }, bg: '#FBEFD9', fg: '#8A5300', icon: 'bulb-outline', needsLocation: true },
  WATER: { label: { ro: 'Apă', ru: 'Вода' }, bg: '#EAF6F8', fg: '#0B4F5A', icon: 'water-outline', needsLocation: true },
  GARBAGE: { label: { ro: 'Salubrizare', ru: 'Мусор' }, bg: '#E7F3EC', fg: '#205C41', icon: 'trash-outline', needsLocation: true },
  TRANSPORT: { label: { ro: 'Transport', ru: 'Транспорт' }, bg: '#EAF6F8', fg: '#0B4F5A', icon: 'bus-outline', needsLocation: false },
  LANDSCAPING: {
    label: { ro: 'Amenajare', ru: 'Благоустройство' },
    bg: '#E7F3EC',
    fg: '#205C41',
    icon: 'leaf-outline',
    needsLocation: true,
  },
  BUILDINGS: { label: { ro: 'Clădiri', ru: 'Здания' }, bg: '#EAF6F8', fg: '#0B4F5A', icon: 'business-outline', needsLocation: true },
  OTHER: { label: { ro: 'Altele', ru: 'Другое' }, bg: '#EEF1F2', fg: '#4A5A60', icon: 'ellipsis-horizontal', needsLocation: false },
};

/** Responsible department, derived from complaint category (frontend mapping). */
export const DEPARTMENT: Record<ComplaintCategory, Label> = {
  ROADS: { ro: 'Drumuri', ru: 'Дорожная служба' },
  LIGHTING: { ro: 'Iluminat public', ru: 'Уличное освещение' },
  WATER: { ro: 'Apă-Canal', ru: 'Водоканал' },
  GARBAGE: { ro: 'Salubrizare', ru: 'Санитарная служба' },
  TRANSPORT: { ro: 'Transport', ru: 'Транспорт' },
  LANDSCAPING: { ro: 'Amenajare', ru: 'Благоустройство' },
  BUILDINGS: { ro: 'Urbanism', ru: 'Градостроительство' },
  OTHER: { ro: 'Primărie', ru: 'Примэрия' },
};

/** Russian agrees with «обращение» (neuter), Romanian with „sesizarea”. */
export const COMPLAINT_STATUS: Record<ComplaintStatus, { label: Label; color: string; bg: string }> = {
  NEW: { label: { ro: 'Nouă', ru: 'Новое' }, color: '#0E7490', bg: '#EAF6F8' },
  IN_PROGRESS: { label: { ro: 'În lucru', ru: 'В работе' }, color: '#8A5300', bg: '#FBEFD9' },
  RESOLVED: { label: { ro: 'Rezolvată', ru: 'Решено' }, color: '#205C41', bg: '#E7F3EC' },
  REJECTED: { label: { ro: 'Respinsă', ru: 'Отклонено' }, color: '#B23A32', bg: '#FBE9E7' },
};

/** Premier Energy outage work types (for composing PARSED notification titles). */
export const WORK_TYPE: Record<WorkType, Label> = {
  lucrari_programate: { ro: 'Lucrări programate', ru: 'Плановые работы' },
  intreruperi_de_manevra: { ro: 'Întreruperi de manevră', ru: 'Оперативные отключения' },
};
