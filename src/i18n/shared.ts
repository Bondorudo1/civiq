import type { Slice } from '@/i18n';
import { ruPlural } from '@/lib/date';

/**
 * Which gated action VerifyGate is standing in for. Callers pass this key, never
 * a word: the verb has to come from the slice so each language can supply its own
 * («подать обращение» is not a word-for-word swap for „depune o sesizare”).
 */
export type GateAction = 'comment' | 'participate' | 'complain';

/**
 * The verb slotted into VerifyGate's three sentences. All three frames govern a
 * bare infinitive in both languages, so one form per action is enough.
 */
const roVerb: Record<GateAction, string> = {
  comment: 'comenta',
  participate: 'participa',
  complain: 'depune o sesizare',
};

const ruVerb: Record<GateAction, string> = {
  comment: 'комментировать',
  participate: 'участвовать',
  complain: 'подать обращение',
};

const ro = {
  /* ErrorView */
  errorTitle: 'Ceva n-a mers',
  errorBody: 'Nu am putut încărca datele. Verifică conexiunea și încearcă din nou.',
  retry: 'Reîncearcă',

  /* AppHeader — screen-reader labels for the bell */
  bell: 'Notificări',
  bellUnread: (n: number) => `Notificări, ${n} necitite`,

  /* VerifyGate */
  gatePendingTitle: 'Verificare în curs',
  gateRejectedTitle: 'Verificare respinsă',
  gateTitle: 'Verifică-te ca locuitor',
  gatePendingBody: (a: GateAction) => `Cererea ta e la primărie. Vei putea ${roVerb[a]} imediat ce este aprobată.`,
  gateRejectedBody: (a: GateAction) => `Cererea a fost respinsă. Corectează datele ca să poți ${roVerb[a]}.`,
  gateBody: (a: GateAction) => `Doar locuitorii verificați pot ${roVerb[a]}. Durează un minut.`,
  gateResubmit: 'Trimite din nou',
  gateVerify: 'Verifică-mă',
};

export const sharedText: Slice<typeof ro> = {
  ro,
  ru: {
    errorTitle: 'Что-то пошло не так',
    errorBody: 'Не удалось загрузить данные. Проверьте соединение и повторите попытку.',
    retry: 'Повторить',

    bell: 'Уведомления',
    /** «уведомление» is neuter: 1 непрочитанное, 2–4 / 5+ непрочитанных. */
    bellUnread: (n) => `Уведомления, ${n} ${ruPlural(n, 'непрочитанное', 'непрочитанных', 'непрочитанных')}`,

    gatePendingTitle: 'Идёт проверка',
    gateRejectedTitle: 'Проверка отклонена',
    gateTitle: 'Подтвердите статус жителя',
    gatePendingBody: (a) => `Ваша заявка в Примэрии. Вы сможете ${ruVerb[a]}, как только её одобрят.`,
    gateRejectedBody: (a) => `Заявка отклонена. Исправьте данные, чтобы ${ruVerb[a]}.`,
    gateBody: (a) => `Только проверенные жители могут ${ruVerb[a]}. Это займёт минуту.`,
    gateResubmit: 'Отправить снова',
    gateVerify: 'Пройти проверку',
  },
};
