import type { Slice } from '@/i18n';
import { ruPlural } from '@/lib/date';

const ro = {
  /** Hero counters: the number is rendered separately, so these are the noun alone. */
  activeProjects: (n: number): string => (n === 1 ? 'proiect activ' : 'proiecte active'),
  complaintsInProgress: (n: number): string => (n === 1 ? 'sesizare în lucru' : 'sesizări în lucru'),

  qaReport: 'Raportează\no problemă',
  qaProjects: 'Proiecte\nși consultări',
  qaMyComplaints: 'Sesizările\nmele',
  qaAsk: 'Întreabă\nprimăria',

  recentProjects: 'Proiecte recente',
  seeAll: 'Toate',
  noProjects: 'Niciun proiect deocamdată',

  /** Stamp on a closed consultation — the decision the primărie published. */
  verdict: 'Verdict',
};

export const homeText: Slice<typeof ro> = {
  ro,
  ru: {
    activeProjects: (n) => ruPlural(n, 'активный проект', 'активных проекта', 'активных проектов'),
    complaintsInProgress: (n) => ruPlural(n, 'обращение в работе', 'обращения в работе', 'обращений в работе'),

    qaReport: 'Сообщить\nо проблеме',
    qaProjects: 'Проекты\nи слушания',
    qaMyComplaints: 'Мои\nобращения',
    qaAsk: 'Спросить\nПримэрию',

    recentProjects: 'Последние проекты',
    seeAll: 'Все',
    noProjects: 'Пока нет проектов',

    verdict: 'Решение',
  },
};
