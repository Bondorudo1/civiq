/** Copy for the project (consultation) detail screen: `src/app/project/[id].tsx`. */

import type { Slice } from '@/i18n';
import { ruPlural } from '@/lib/date';

const ro = {
  // --- header ---
  back: 'Înapoi',
  title: 'Proiect',
  share: 'Distribuie proiectul',
  shareMessage: (title: string) => `${title}\n\nConsultare publică — CiviQ Cahul`,

  // --- loading / missing ---
  loading: 'Se încarcă…',
  notFoundTitle: 'Proiect negăsit',
  notFoundMessage: 'Acest proiect nu există sau a fost eliminat.',

  // --- AI translation ---
  machineTranslated: (cached: boolean) => `Tradus automat${cached ? ' · din cache' : ''}`,
  translateError: 'Traducerea nu e disponibilă acum. Încearcă din nou.',

  // --- reactions ---
  support: (n: number) => `Susțin, ${n}`,
  oppose: (n: number) => `Nu susțin, ${n}`,
  commentsAction: (n: number) => `Comentează, ${n} comentarii`,

  // --- verdict ---
  verdict: 'Verdictul primăriei',

  // --- AI summary ---
  summaryLabel: 'SINTEZA DISCUȚIEI',
  summaryBasedOn: (n: number) => `${n} mesaje`,
  summaryTeaser: (n: number) => `Vezi pe scurt ce spun cei ${n} participanți, fără să citești tot firul.`,
  summaryError: 'Sinteza nu e disponibilă acum. Încearcă din nou.',
  summarizing: 'Se rezumă…',
  summaryRefresh: 'Actualizează sinteza',
  summarize: 'Rezumă discuția',

  // --- comment thread ---
  commentsHead: (n: number) => `COMENTARII · ${n}`,
  like: (n: number) => `Apreciez, ${n}`,
  reply: 'Răspunde',
  remove: 'Șterge',
  removeComment: 'Șterge comentariul',
  officialChip: 'RĂSPUNS OFICIAL',
  sending: 'Se trimite…',

  // --- composer ---
  closed: 'Consultarea s-a încheiat. Comentariile sunt închise.',
  replyingTo: (name: string) => `Răspunzi lui ${name}`,
  cancelReply: 'Anulează răspunsul',
  replyPlaceholder: 'Scrie un răspuns…',
  commentPlaceholder: 'Scrie un comentariu…',
  send: 'Trimite comentariul',
};

export const projectText: Slice<typeof ro> = {
  ro,
  ru: {
    back: 'Назад',
    title: 'Проект',
    share: 'Поделиться проектом',
    shareMessage: (title: string) => `${title}\n\nПубличные консультации — CiviQ Cahul`,

    loading: 'Загрузка…',
    notFoundTitle: 'Проект не найден',
    notFoundMessage: 'Такого проекта нет или он был удалён.',

    machineTranslated: (cached: boolean) => `Машинный перевод${cached ? ' · из кеша' : ''}`,
    translateError: 'Перевод сейчас недоступен. Попробуйте ещё раз.',

    support: (n: number) => `Поддерживаю, ${n}`,
    oppose: (n: number) => `Не поддерживаю, ${n}`,
    commentsAction: (n: number) =>
      `Комментировать, ${n} ${ruPlural(n, 'комментарий', 'комментария', 'комментариев')}`,

    verdict: 'Решение Примэрии',

    summaryLabel: 'СВОДКА ОБСУЖДЕНИЯ',
    summaryBasedOn: (n: number) => `${n} ${ruPlural(n, 'сообщение', 'сообщения', 'сообщений')}`,
    // The imperative keeps «не читая» attached to the reader, not to the participants.
    summaryTeaser: (n: number) =>
      `Узнайте кратко, что говорят ${n} ${ruPlural(n, 'участник', 'участника', 'участников')}, не читая всю ветку.`,
    summaryError: 'Сводка сейчас недоступна. Попробуйте ещё раз.',
    summarizing: 'Составляем сводку…',
    summaryRefresh: 'Обновить сводку',
    summarize: 'Составить сводку',

    commentsHead: (n: number) => `КОММЕНТАРИИ · ${n}`,
    like: (n: number) => `Нравится, ${n}`,
    reply: 'Ответить',
    remove: 'Удалить',
    removeComment: 'Удалить комментарий',
    officialChip: 'ОФИЦИАЛЬНЫЙ ОТВЕТ',
    sending: 'Отправляется…',

    closed: 'Публичные консультации завершены. Комментарии закрыты.',
    // Names stay undeclined, so a colon instead of a dative («Ответить Иону»).
    replyingTo: (name: string) => `Ответ: ${name}`,
    cancelReply: 'Отменить ответ',
    replyPlaceholder: 'Напишите ответ…',
    commentPlaceholder: 'Напишите комментарий…',
    send: 'Отправить комментарий',
  },
};
