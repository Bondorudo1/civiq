/** Sesizări tab — the list of a resident's complaints and their 30-day window. */

import type { Slice } from '@/i18n';
import { ruPlural } from '@/lib/date';

const ro = {
  title: 'Sesizări',
  responsePromise: 'Primăria răspunde în 30 de zile',
  statInWork: 'în lucru',
  statAwaiting: 'te așteaptă',
  statTotal: 'total',
  filterAll: 'Toate',
  filed: (date: string) => `depusă ${date}`,
  responseTerm: 'Termen de răspuns',
  windowValue: (remaining: number, total: number) => `${remaining} / ${total} zile`,
  loading: 'Se încarcă sesizările…',
  emptyTitle: 'Nicio sesizare',
  emptyFiltered: 'Nimic cu acest status.',
  emptyPrompt: 'Ai observat o problemă în oraș? Anunță primăria.',
  newComplaint: 'Sesizare nouă',
};

export const complaintsText: Slice<typeof ro> = {
  ro,
  ru: {
    title: 'Обращения',
    responsePromise: 'Примэрия отвечает в течение 30 дней',
    statInWork: 'в работе',
    statAwaiting: 'ждут вас',
    statTotal: 'всего',
    filterAll: 'Все',
    // «обращение» is neuter — подано, not подана.
    filed: (date: string) => `подано ${date}`,
    responseTerm: 'Срок ответа',
    windowValue: (remaining: number, total: number) =>
      `${remaining} / ${total} ${ruPlural(total, 'день', 'дня', 'дней')}`,
    loading: 'Загрузка обращений…',
    emptyTitle: 'Нет обращений',
    emptyFiltered: 'Нет обращений с таким статусом.',
    emptyPrompt: 'Заметили проблему в городе? Сообщите в Примэрию.',
    newComplaint: 'Новое обращение',
  },
};
