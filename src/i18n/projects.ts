import type { Slice } from '@/i18n';

const ro = {
  title: 'Proiecte',
  searchPlaceholder: 'Caută proiecte…',
  all: 'Toate',
  loading: 'Se încarcă proiectele…',
  emptyTitle: 'Niciun proiect',
  emptyFiltered: 'Nimic pentru filtrul ales.',
  emptyNone: 'Nu există proiecte deocamdată.',
};

export const projectsText: Slice<typeof ro> = {
  ro,
  ru: {
    title: 'Проекты',
    searchPlaceholder: 'Поиск проектов…',
    all: 'Все',
    loading: 'Загрузка проектов…',
    emptyTitle: 'Проектов нет',
    emptyFiltered: 'Ничего по выбранному фильтру.',
    emptyNone: 'Пока нет проектов.',
  },
};
