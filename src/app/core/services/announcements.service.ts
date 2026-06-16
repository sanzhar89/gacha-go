import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Announcement, AnnouncementAudience } from '../models/announcement.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'gg_announcements';

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: 'ВСЕ · 342 получателя',
  mem: 'УЧАСТНИКИ · 334 получателя',
  tr: 'ТРЕНЕРЫ · 8 получателей',
};

const AUDIENCE_COUNTS: Record<AnnouncementAudience, number> = {
  all: 342,
  mem: 334,
  tr: 8,
};

const DEFAULT_RECENT: Announcement[] = [
  {
    id: '1',
    audience: 'all',
    audienceLabel: AUDIENCE_LABELS.all,
    date: '10 июня',
    title: 'Новый зал свободных весов открыт',
    message: 'Мы открыли новый зал свободных весов на втором этаже.',
    stats: 'Доставлено 338 · открыли 71%',
    pushEnabled: true,
    emailEnabled: false,
  },
  {
    id: '2',
    audience: 'tr',
    audienceLabel: AUDIENCE_LABELS.tr,
    date: '6 июня',
    title: 'Планёрка по новым планам в пятницу',
    message: 'Собираемся в пятницу в 10:00 в переговорной.',
    stats: 'Доставлено 8 · открыли 100%',
    pushEnabled: true,
    emailEnabled: true,
  },
  {
    id: '3',
    audience: 'mem',
    audienceLabel: AUDIENCE_LABELS.mem,
    date: '1 июня',
    title: 'Летний челлендж: 20 тренировок за месяц',
    message: 'Участвуй в челлендже и получи бейдж в приложении.',
    stats: 'Доставлено 330 · открыли 84%',
    pushEnabled: true,
    emailEnabled: false,
  },
];

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private readonly storage = inject(StorageService);

  private readonly announcementsSubject = new BehaviorSubject<Announcement[]>(
    this.storage.get(STORAGE_KEY, DEFAULT_RECENT),
  );

  readonly announcements$ = this.announcementsSubject.asObservable();

  get announcements(): Announcement[] {
    return this.announcementsSubject.value;
  }

  send(payload: {
    audience: AnnouncementAudience;
    title: string;
    message: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
  }): Announcement {
    const count = AUDIENCE_COUNTS[payload.audience];
    const delivered = Math.round(count * 0.98);
    const opened = Math.round(delivered * 0.75);
    const announcement: Announcement = {
      id: crypto.randomUUID(),
      audience: payload.audience,
      audienceLabel: AUDIENCE_LABELS[payload.audience],
      title: payload.title.trim(),
      message: payload.message.trim(),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
      stats: `Доставлено ${delivered} · открыли ${Math.round((opened / delivered) * 100)}%`,
      pushEnabled: payload.pushEnabled,
      emailEnabled: payload.emailEnabled,
    };
    const next = [announcement, ...this.announcements];
    this.announcementsSubject.next(next);
    this.storage.set(STORAGE_KEY, next);
    return announcement;
  }

  delete(id: string): void {
    const next = this.announcements.filter((a) => a.id !== id);
    this.announcementsSubject.next(next);
    this.storage.set(STORAGE_KEY, next);
  }
}
