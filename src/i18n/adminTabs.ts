/**
 * The primărie panel shell — complaints queue, proiecte, anunțuri, the resident
 * verification queue and the operator's account. Operator register throughout:
 * this is the desk side of CiviQ, not the resident side.
 */

import type { VerificationStatus } from '@/api/types';
import type { Slice } from '@/i18n';
import { days, ruPlural } from '@/lib/date';

/**
 * Status of a verification request as stamped on the operator's card. Kept here
 * rather than read from VERIFICATION_LABEL, which is still Romanian-only.
 */
const verificationRo: Record<VerificationStatus, string> = {
  UNVERIFIED: 'Neverificat',
  PENDING: 'În verificare',
  VERIFIED: 'Verificat',
  REJECTED: 'Respins',
};

const ro = {
  // Shell — the standing plate and the five tabs.
  plate: 'PRIMĂRIE',
  tabQueue: 'Sesizări',
  tabPosts: 'Proiecte',
  tabNotices: 'Anunțuri',
  tabResidents: 'Locuitori',
  tabAccount: 'Cont',

  // Sesizări — the work queue.
  queueTitle: 'Sesizări',
  queueSubtitle: 'Coada de lucru a primăriei',
  statNew: 'noi',
  statInWork: 'în lucru',
  statOverdue: 'termen depășit',
  filterAll: 'Toate',
  overdueBy: (n: number) => `Termen depășit cu ${n} zile`,
  daysLeft: (n: number) => `${n} zile rămase`,
  queueLoading: 'Se încarcă coada…',
  queueEmptyTitle: 'Nimic în coadă',
  queueEmptyAll: 'Nicio sesizare de la cetățeni.',
  queueEmptyFiltered: 'Nimic cu acest status.',

  // Proiecte.
  postsTitle: 'Proiecte',
  postsSubtitle: (open: number, total: number) => `${open} deschise · ${total} în total`,
  postOpen: 'DESCHIS',
  postClosed: 'ÎNCHIS',
  postMeta: (likes: number, comments: number) => `${likes} susțin · ${comments} comentarii`,
  postsLoading: 'Se încarcă proiectele…',
  postsEmptyTitle: 'Niciun proiect',
  postsEmptyMessage: 'Nu ai publicat consultări încă.',
  newPost: 'Proiect nou',

  // Anunțuri.
  noticesTitle: 'Anunțuri',
  noticesSubtitle: (mine: number, total: number) => `${mine} de la primărie · ${total} în total`,
  noticeParsed: 'PARSAT · PREMIER ENERGY',
  noticeManual: 'ANUNȚ PRIMĂRIE',
  noticeFallbackTitle: 'Întrerupere programată',
  noticesLoading: 'Se încarcă anunțurile…',
  noticesEmptyTitle: 'Niciun anunț',
  noticesEmptyMessage: 'Nu ai publicat anunțuri încă.',
  newNotice: 'Anunț nou',

  // Locuitori — the verification queue.
  residentsTitle: 'Locuitori',
  residentsWaiting: (n: number) => `${n} cereri în așteptare`,
  residentsNoneWaiting: 'Nicio cerere în așteptare',
  filterPending: (n: number) => `În așteptare (${n})`,
  filterAllCount: (n: number) => `Toate (${n})`,
  verification: verificationRo,
  filedOn: (date: string) => `Depusă ${date}`,
  reasonShown: (reason: string) => `Motiv: ${reason}`,
  rejectPlaceholder: 'De ce respingi cererea? Motivul ajunge la locuitor.',
  cancel: 'Anulează',
  reject: 'Respinge',
  approve: 'Aprobă',
  approveTitle: 'Aprobi cererea?',
  approveBody: (name: string) => `${name} va putea comenta, reacționa și depune sesizări.`,
  residentsLoading: 'Se încarcă cererile…',
  residentsEmptyTitle: 'Nicio cerere',
  residentsEmptyMessage: 'Cererile de verificare de la locuitori apar aici.',

  // Cont.
  accountTitle: 'Cont',
  operator: 'OPERATOR',
  role: 'ROL: ADMIN',
  language: 'Limbă',
  signOut: 'Deconectare',
  version: 'CiviQ · Panou primărie · v1.0',
};

export const adminTabsText: Slice<typeof ro> = {
  ro,
  ru: {
    plate: 'ПРИМЭРИЯ',
    tabQueue: 'Обращения',
    tabPosts: 'Проекты',
    tabNotices: 'Объявления',
    tabResidents: 'Жители',
    tabAccount: 'Аккаунт',

    queueTitle: 'Обращения',
    queueSubtitle: 'Рабочая очередь Примэрии',
    statNew: 'новые',
    statInWork: 'в работе',
    statOverdue: 'просрочено',
    filterAll: 'Все',
    overdueBy: (n: number) => `Просрочено на ${days(n, 'ru')}`,
    daysLeft: (n: number) => `осталось ${days(n, 'ru')}`,
    queueLoading: 'Загрузка очереди…',
    queueEmptyTitle: 'Очередь пуста',
    queueEmptyAll: 'Обращений от жителей нет.',
    queueEmptyFiltered: 'Нет обращений с таким статусом.',

    postsTitle: 'Проекты',
    // «проект» is masculine — 1 открытый, 2 открытых.
    postsSubtitle: (open: number, total: number) =>
      `${open} ${ruPlural(open, 'открытый', 'открытых', 'открытых')} · всего ${total}`,
    postOpen: 'ОТКРЫТ',
    postClosed: 'ЗАКРЫТ',
    postMeta: (likes: number, comments: number) =>
      `${likes} ${ruPlural(likes, 'поддержал', 'поддержали', 'поддержали')} · ` +
      `${comments} ${ruPlural(comments, 'комментарий', 'комментария', 'комментариев')}`,
    postsLoading: 'Загрузка проектов…',
    postsEmptyTitle: 'Проектов нет',
    postsEmptyMessage: 'Вы ещё не публиковали консультации.',
    newPost: 'Новый проект',

    noticesTitle: 'Объявления',
    noticesSubtitle: (mine: number, total: number) => `${mine} от Примэрии · всего ${total}`,
    // The Premier Energy scraper's own rows — the brand name stays as it is.
    noticeParsed: 'ИМПОРТ · PREMIER ENERGY',
    noticeManual: 'ОБЪЯВЛЕНИЕ ПРИМЭРИИ',
    noticeFallbackTitle: 'Плановое отключение',
    noticesLoading: 'Загрузка объявлений…',
    noticesEmptyTitle: 'Объявлений нет',
    noticesEmptyMessage: 'Вы ещё не публиковали объявления.',
    newNotice: 'Новое объявление',

    residentsTitle: 'Жители',
    residentsWaiting: (n: number) => `${n} ${ruPlural(n, 'заявка', 'заявки', 'заявок')} на рассмотрении`,
    residentsNoneWaiting: 'Нет заявок на рассмотрении',
    filterPending: (n: number) => `На рассмотрении (${n})`,
    filterAllCount: (n: number) => `Все (${n})`,
    verification: {
      UNVERIFIED: 'Не подтверждён',
      PENDING: 'На проверке',
      VERIFIED: 'Подтверждён',
      REJECTED: 'Отклонён',
    },
    // «заявка» is feminine — подана, not подано.
    filedOn: (date: string) => `Подана ${date}`,
    reasonShown: (reason: string) => `Причина: ${reason}`,
    rejectPlaceholder: 'Почему отклоняете заявку? Причину увидит житель.',
    cancel: 'Отмена',
    reject: 'Отклонить',
    approve: 'Одобрить',
    approveTitle: 'Одобрить заявку?',
    approveBody: (name: string) => `${name} сможет комментировать, реагировать и подавать обращения.`,
    residentsLoading: 'Загрузка заявок…',
    residentsEmptyTitle: 'Заявок нет',
    residentsEmptyMessage: 'Здесь появляются заявки жителей на подтверждение.',

    accountTitle: 'Аккаунт',
    operator: 'ОПЕРАТОР',
    role: 'РОЛЬ: ADMIN',
    language: 'Язык',
    signOut: 'Выйти',
    version: 'CiviQ · Панель Примэрии · v1.0',
  },
};
