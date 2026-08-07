/**
 * Copy for Profil and the resident tab bar (Acasă / Proiecte / Sesizări / Profil).
 */

import type { Slice } from '@/i18n';

const ro = {
  title: 'Profil',

  editName: 'Editează numele',
  fullName: 'Nume complet',
  namePlaceholder: 'Numele tău',
  cancel: 'Anulează',
  saving: 'Se salvează…',
  save: 'Salvează',

  status: 'Statut',
  verified: 'Locuitor verificat',
  verifiedBody: 'Poți comenta, reacționa și depune sesizări.',

  language: 'Limbă',
  // Each language is named in itself on both sides of the switch — a Russian
  // speaker scans for «Русский», not for its Romanian name.
  languageRo: 'Română',
  languageRu: 'Русский',

  signOut: 'Deconectare',
  // Brand lockup: product name, city and version read the same in both languages.
  version: 'CiviQ · Cahul · v1.0',

  tabHome: 'Acasă',
  tabProjects: 'Proiecte',
  tabComplaints: 'Sesizări',
  tabProfile: 'Profil',
};

export const profileText: Slice<typeof ro> = {
  ro,
  ru: {
    title: 'Профиль',

    editName: 'Изменить имя',
    fullName: 'Имя и фамилия',
    namePlaceholder: 'Ваше имя',
    cancel: 'Отмена',
    saving: 'Сохранение…',
    save: 'Сохранить',

    status: 'Статус',
    verified: 'Житель подтверждён',
    verifiedBody: 'Вы можете комментировать, реагировать и подавать обращения.',

    language: 'Язык',
    languageRo: 'Română',
    languageRu: 'Русский',

    signOut: 'Выйти',
    version: 'CiviQ · Cahul · v1.0',

    tabHome: 'Главная',
    tabProjects: 'Проекты',
    tabComplaints: 'Обращения',
    tabProfile: 'Профиль',
  },
};
