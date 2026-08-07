import type { Slice } from '@/i18n';

/**
 * Tab labels live here rather than in each layout's `Tabs.Screen options`,
 * because React Navigation does not re-read those options when the locale
 * changes — the bar kept its Romanian labels while every screen switched.
 * CivicTabBar resolves them itself, so it re-renders with the language.
 *
 * Keyed by shell: both shells have routes called `index` and `proiecte`, and
 * they mean different things (Acasă vs. the complaints queue).
 */
const ro = {
  citizen: { index: 'Acasă', proiecte: 'Proiecte', contact: 'Sesizări', profil: 'Profil' },
  admin: {
    index: 'Sesizări',
    proiecte: 'Proiecte',
    anunturi: 'Anunțuri',
    locuitori: 'Locuitori',
    cont: 'Cont',
  },
};

export const tabsText: Slice<typeof ro> = {
  ro,
  ru: {
    citizen: { index: 'Главная', proiecte: 'Проекты', contact: 'Обращения', profil: 'Профиль' },
    admin: {
      index: 'Обращения',
      proiecte: 'Проекты',
      anunturi: 'Объявления',
      locuitori: 'Жители',
      cont: 'Аккаунт',
    },
  },
};

export type Shell = keyof typeof ro;
