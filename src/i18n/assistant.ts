/**
 * Copy for the assistant group: the AI chat (`ask`) and the residency
 * verification request (`verify`).
 *
 * Russian notes: „cerere” is «заявка» here, kept distinct from «обращение»
 * (sesizare) so the resident can tell a verification request from a complaint.
 * „primărie” is «Примэрия», „locuitor” is «житель», and Cahul takes its usual
 * Russian form, Кагул.
 */

import type { Slice } from '@/i18n';

const ro = {
  // --- ask ---
  back: 'Înapoi',
  barTitle: 'Asistentul primăriei',
  barSub: 'Răspunde din regulamentele orașului',
  newChat: 'Conversație nouă',
  introTitle: 'Ce vrei să afli?',
  introText:
    'Întreabă despre acte, taxe, programul ghișeelor sau deciziile consiliului. Îți arăt și sursele.',
  /** Openers that show the assistant's range without the citizen having to guess. */
  suggestions: [
    'Ce acte îmi trebuie pentru autorizația de construcție?',
    'Cum depun o cerere la ghișeul unic?',
    'În cât timp răspunde primăria la o sesizare?',
    'Unde plătesc impozitul pe bunuri imobiliare?',
  ] as [string, string, string, string],
  chatFailed: 'Asistentul nu a răspuns. Încearcă din nou.',
  retry: 'Reîncearcă',
  typing: 'Caut în documente…',
  disclaimer: 'Informativ. Pentru situații specifice, confirmă la ghișeul primăriei.',
  composerFirst: 'Scrie întrebarea ta…',
  composerMore: 'Întreabă altceva…',
  sendQuestion: 'Trimite întrebarea',

  // --- verify ---
  verifyTitle: 'Verificare',
  heroTitle: 'Confirmă că locuiești în Cahul',
  heroText:
    'Oricine poate citi ce se întâmplă în oraș. Ca să comentezi, să reacționezi sau să depui o sesizare, primăria trebuie să știe că ești locuitor.',
  rejected: 'Cererea anterioară a fost respinsă. Verifică datele și trimite din nou.',
  reasons: [
    'Un locuitor, o singură voce — nimeni nu votează de zece ori.',
    'Sesizările ajung la echipa potrivită, pe adresa potrivită.',
    'Datele merg doar la primărie și nu apar public.',
  ] as [string, string, string],
  idnpLabel: 'IDNP',
  idnpPlaceholder: '13 cifre',
  idnpHint: 'IDNP-ul are exact 13 cifre.',
  addressLabel: 'Adresa de domiciliu',
  /** A Cahul street, so it stays in Romanian on both locales — as it does on the ID. */
  addressPlaceholder: 'str. Independenței 24, ap. 3',
  submit: 'Trimite cererea',
  submitting: 'Se trimite…',
  submitFailed: 'Nu am putut trimite cererea. Încearcă din nou.',
  legal: 'Datele sunt folosite doar pentru confirmarea domiciliului și nu sunt afișate public.',
  sentTitle: 'Cererea a fost trimisă',
  sentText: 'Primăria confirmă datele și îți deschide accesul. Vei primi o notificare cu decizia.',
  sentNote: 'Până atunci poți citi proiectele și anunțurile, dar nu poți comenta sau depune sesizări.',
  backHome: 'Înapoi acasă',
};

export const assistantText: Slice<typeof ro> = {
  ro,
  ru: {
    // --- ask ---
    back: 'Назад',
    barTitle: 'Помощник Примэрии',
    barSub: 'Отвечает по городским регламентам',
    newChat: 'Новый разговор',
    introTitle: 'Что вас интересует?',
    introText:
      'Спросите о документах, налогах, часах приёма или решениях совета. Покажу и источники.',
    suggestions: [
      'Какие документы нужны для разрешения на строительство?',
      'Как подать заявление через единое окно?',
      'В какой срок Примэрия отвечает на обращение?',
      'Где оплатить налог на недвижимое имущество?',
    ],
    chatFailed: 'Помощник не ответил. Попробуйте ещё раз.',
    retry: 'Повторить',
    typing: 'Ищу в документах…',
    disclaimer: 'Справочно. В конкретных случаях уточните в Примэрии.',
    composerFirst: 'Напишите свой вопрос…',
    composerMore: 'Спросите ещё…',
    sendQuestion: 'Отправить вопрос',

    // --- verify ---
    verifyTitle: 'Подтверждение',
    heroTitle: 'Подтвердите, что вы житель Кагула',
    heroText:
      'Читать о том, что происходит в городе, может каждый. Чтобы комментировать, реагировать или подать обращение, Примэрии нужно знать, что вы житель города.',
    rejected: 'Предыдущая заявка отклонена. Проверьте данные и отправьте снова.',
    reasons: [
      'Один житель — один голос: никто не проголосует десять раз.',
      'Обращения попадают к нужной службе и по нужному адресу.',
      'Данные передаются только Примэрии и публично не отображаются.',
    ],
    idnpLabel: 'IDNP',
    idnpPlaceholder: '13 цифр',
    idnpHint: 'IDNP состоит ровно из 13 цифр.',
    addressLabel: 'Адрес проживания',
    addressPlaceholder: 'str. Independenței 24, ap. 3',
    submit: 'Отправить заявку',
    submitting: 'Отправка…',
    submitFailed: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    legal: 'Данные используются только для подтверждения места жительства и публично не отображаются.',
    sentTitle: 'Заявка отправлена',
    sentText: 'Примэрия подтвердит данные и откроет доступ. О решении придёт уведомление.',
    sentNote: 'До этого можно читать проекты и объявления, но не комментировать и не подавать обращения.',
    backHome: 'На главную',
  },
};
