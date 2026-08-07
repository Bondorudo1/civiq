/**
 * Copy for the complaint detail screen (status timeline, official response) and
 * the notifications feed — the two places a resident follows up on a filing.
 */

import type { Slice } from '@/i18n';
import { ruPlural } from '@/lib/date';

const ro = {
  // --- Complaint detail ---
  screenTitle: 'Sesizare',
  loading: 'Se încarcă…',
  notFoundTitle: 'Sesizare negăsită',
  notFoundMessage: 'Această sesizare nu există sau nu îți aparține.',
  responsible: (department: string) => `Responsabil: ${department}`,
  timeline: 'EVOLUȚIE',
  stepSubmitted: 'Trimisă',
  stepInProgress: 'În lucru',
  stepRejected: 'Respinsă',
  stepResolved: 'Rezolvată',
  adminResponse: 'Răspunsul primăriei',

  // --- Notifications ---
  notificationsTitle: 'Notificări',
  back: 'Înapoi',
  markAll: 'Marchează toate',
  markAllA11y: (unread: number) => `Marchează toate ca citite, ${unread} necitite`,
  kinds: {
    ALL: 'Toate',
    COMPLAINT_STATUS: 'Sesizările mele',
    MANUAL: 'Primărie',
    PARSED: 'Utilități',
  },
  cityHall: 'Primăria Cahul',
  outageSource: (workType: string) => `Premier Energy · ${workType}`,
  outageAction: 'Vezi anunțul complet',
  complaintStatusTitle: (status: string) => `Sesizare: ${status}`,
  complaintStatusBody: (title: string) => `Statusul sesizării „${title}” s-a actualizat.`,
  complaintAction: 'Vezi sesizarea',
  loadingNotifications: 'Se încarcă notificările…',
  emptyTitle: 'Nicio notificare',
  emptyMessage: 'Aici vei primi anunțuri de la primărie și de la Premier Energy.',
};

export const complaintDetailText: Slice<typeof ro> = {
  ro,
  ru: {
    // --- Complaint detail ---
    // «обращение» is neuter, so every step reads Отправлено / Решено / Отклонено.
    screenTitle: 'Обращение',
    loading: 'Загрузка…',
    notFoundTitle: 'Обращение не найдено',
    notFoundMessage: 'Такого обращения нет или оно вам не принадлежит.',
    responsible: (department: string) => `Ответственный: ${department}`,
    timeline: 'ХОД РАССМОТРЕНИЯ',
    stepSubmitted: 'Отправлено',
    stepInProgress: 'В работе',
    stepRejected: 'Отклонено',
    stepResolved: 'Решено',
    adminResponse: 'Ответ примэрии',

    // --- Notifications ---
    notificationsTitle: 'Уведомления',
    back: 'Назад',
    markAll: 'Отметить все',
    markAllA11y: (unread: number) =>
      `Отметить все как прочитанные, ${unread} ${ruPlural(
        unread,
        'непрочитанное уведомление',
        'непрочитанных уведомления',
        'непрочитанных уведомлений',
      )}`,
    kinds: {
      ALL: 'Все',
      COMPLAINT_STATUS: 'Мои обращения',
      MANUAL: 'Примэрия',
      PARSED: 'Коммунальные',
    },
    // Кагул is the established Russian name of Cahul.
    cityHall: 'Примэрия Кагула',
    outageSource: (workType: string) => `Premier Energy · ${workType}`,
    outageAction: 'Открыть объявление',
    complaintStatusTitle: (status: string) => `Обращение: ${status}`,
    complaintStatusBody: (title: string) => `Статус обращения «${title}» изменился.`,
    complaintAction: 'Открыть обращение',
    loadingNotifications: 'Загрузка уведомлений…',
    emptyTitle: 'Нет уведомлений',
    emptyMessage: 'Здесь появятся объявления примэрии и Premier Energy.',
  },
};
