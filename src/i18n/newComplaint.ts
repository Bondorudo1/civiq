/** Copy for the new-complaint form (src/app/complaint/new.tsx). */

import type { Slice } from '@/i18n';
import { days } from '@/lib/date';

const ro = {
  back: 'Înapoi',
  title: 'Sesizare nouă',

  categoryLabel: 'Categorie',

  titleLabel: 'Titlu',
  titlePlaceholder: 'Pe scurt, care e problema?',

  descriptionLabel: 'Descriere',
  descriptionPlaceholder: 'Descrie problema: ce, unde, de când…',
  spellPending: 'Se verifică…',
  spellCheck: 'Verifică textul',
  spellFailed: 'Corectarea nu e disponibilă acum. Poți trimite textul așa cum e.',

  locationLabel: 'Locație',
  addressPlaceholder: 'Adresa (ex. str. Independenței 24)',
  pickOnMap: 'Alege locația pe hartă',

  photoLabel: 'Fotografie (opțional)',
  addPhoto: 'Adaugă o fotografie',
  photoType: 'Sunt acceptate doar imagini JPEG, PNG sau WebP.',
  photoTooLarge: 'Fotografia depășește 10 MB. Alege una mai mică.',

  hint: 'Alege o categorie și completează titlul (min. 5 caractere) și descrierea (min. 10).',
  submitting: 'Se trimite…',
  submit: 'Trimite sesizarea',
  submitFailed: 'Nu am putut trimite sesizarea. Verifică conexiunea și încearcă din nou.',

  successTitle: 'Sesizarea a fost trimisă',
  successMsg: 'Primăria răspunde în 30 de zile. Vei primi o notificare la fiecare schimbare de status.',
  seeMine: 'Vezi sesizările mele',
  backHome: 'Înapoi acasă',
};

export const newComplaintText: Slice<typeof ro> = {
  ro,
  ru: {
    back: 'Назад',
    title: 'Новое обращение',

    categoryLabel: 'Категория',

    titleLabel: 'Тема',
    titlePlaceholder: 'Кратко: в чём проблема?',

    descriptionLabel: 'Описание',
    descriptionPlaceholder: 'Опишите проблему: что, где, как давно…',
    spellPending: 'Проверка…',
    spellCheck: 'Проверить текст',
    spellFailed: 'Проверка сейчас недоступна. Можно отправить текст как есть.',

    locationLabel: 'Место',
    addressPlaceholder: 'Адрес (напр. str. Independenței 24)',
    pickOnMap: 'Выбрать место на карте',

    photoLabel: 'Фото (необязательно)',
    addPhoto: 'Добавить фото',
    photoType: 'Принимаются только изображения JPEG, PNG или WebP.',
    photoTooLarge: 'Фото превышает 10 МБ. Выберите файл поменьше.',

    hint: 'Выберите категорию и заполните тему (мин. 5 символов) и описание (мин. 10).',
    submitting: 'Отправка…',
    submit: 'Отправить обращение',
    submitFailed: 'Не удалось отправить обращение. Проверьте соединение и попробуйте ещё раз.',

    successTitle: 'Обращение отправлено',
    // The response window is a count, so it goes through days() rather than a
    // hardcoded «дней» — Romanian keeps its own fixed wording.
    successMsg: `Примэрия ответит в течение ${days(30, 'ru')}. Вы получите уведомление при каждом изменении статуса.`,
    seeMine: 'Мои обращения',
    backHome: 'На главную',
  },
};
