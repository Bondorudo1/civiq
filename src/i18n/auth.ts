/**
 * Login and the 4-step register wizard.
 *
 * These two screens run before there is an account, so they index this slice
 * with the RO/RU state they already carry rather than calling `useT` — the
 * toggle is the resident's only way to pick a language pre-login, and
 * `useLocale()` would fire a `/me` request with no token behind it.
 */

import type { Slice } from '@/i18n';

const ro = {
  // Hero
  welcome: 'Bine ai venit',
  welcomeSub: 'Vocea ta pentru Cahul',

  // Login
  title: 'Autentificare',
  subtitle: 'Intră dacă ai deja un cont',
  emailLabel: 'Email',
  emailPlaceholder: 'nume@exemplu.md',
  passwordLabel: 'Parolă',
  submitting: 'Se conectează…',
  submit: 'Intră în cont',
  noAccount: 'Nu ai cont?',
  signUp: 'Înregistrează-te',
  errCredentials: 'Email sau parolă incorectă.',
  errNetwork: 'Nu ne-am putut conecta. Verifică rețeaua și încearcă din nou.',

  // Register wizard
  back: 'Înapoi',
  stepOf: (n: number, total: number) => `Pasul ${n} din ${total}`,
  nameTitle: 'Cum te cheamă?',
  nameLabel: 'Nume complet',
  namePlaceholder: 'Ion Popescu',
  credentialsTitle: 'Date de conectare',
  passwordHelp: 'Minim 8 caractere.',
  localeTitle: 'Ce limbă preferi?',
  /** Endonyms: a language always names itself, so these read the same in both. */
  langRo: 'Română',
  langRu: 'Русский',
  doneTitle: 'Bine ai venit în CiviQ!',
  doneBody: 'Contul tău este gata. Hai să facem orașul mai bun, împreună.',
  next: 'Mai departe',
  enterApp: 'Intră în aplicație',
  errEmailTaken: 'Există deja un cont cu acest email.',
  errValidation: 'Verifică datele: parola trebuie să aibă minim 8 caractere.',
  errRegisterFailed: 'Nu am putut crea contul. Încearcă din nou.',
};

export const authText: Slice<typeof ro> = {
  ro,
  ru: {
    // Hero
    welcome: 'Добро пожаловать',
    // Кагул is the city's established Russian name, used by the Primăria itself.
    welcomeSub: 'Ваш голос в Кагуле',

    // Login
    title: 'Вход',
    subtitle: 'Войдите, если у вас уже есть аккаунт',
    emailLabel: 'Email',
    emailPlaceholder: 'name@example.md',
    passwordLabel: 'Пароль',
    submitting: 'Выполняется вход…',
    submit: 'Войти в аккаунт',
    noAccount: 'Нет аккаунта?',
    signUp: 'Зарегистрироваться',
    errCredentials: 'Неверный email или пароль.',
    errNetwork: 'Не удалось подключиться. Проверьте сеть и повторите попытку.',

    // Register wizard
    back: 'Назад',
    stepOf: (n: number, total: number) => `Шаг ${n} из ${total}`,
    nameTitle: 'Как вас зовут?',
    nameLabel: 'Имя и фамилия',
    // Transliterated rather than replaced: the same resident, spelled for a
    // Cyrillic reader, matching the given-name-first order of the field.
    namePlaceholder: 'Ион Попеску',
    credentialsTitle: 'Данные для входа',
    passwordHelp: 'Минимум 8 символов.',
    localeTitle: 'Какой язык предпочитаете?',
    langRo: 'Română',
    langRu: 'Русский',
    doneTitle: 'Добро пожаловать в CiviQ!',
    doneBody: 'Ваш аккаунт готов. Сделаем город лучше вместе.',
    next: 'Далее',
    enterApp: 'Войти в приложение',
    errEmailTaken: 'Аккаунт с таким email уже существует.',
    errValidation: 'Проверьте данные: пароль должен содержать минимум 8 символов.',
    errRegisterFailed: 'Не удалось создать аккаунт. Попробуйте ещё раз.',
  },
};
