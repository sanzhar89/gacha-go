import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Announcement } from '../models/announcement.model';
import { UserRole } from '../models/user.model';
import { AnnouncementsService } from './announcements.service';
import { StorageService } from './storage.service';

const READ_KEY = 'gg_notifications_read';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly storage = inject(StorageService);

  private readonly readIds = new Set<string>(this.storage.get<string[]>(READ_KEY, []));
  private readonly readSubject = new BehaviorSubject<Set<string>>(this.readIds);

  readonly readState$ = this.readSubject.asObservable();

  listForRole(role: UserRole): Announcement[] {
    return this.announcementsService.announcements.filter((item) => this.isVisibleForRole(item, role));
  }

  unreadCount(role: UserRole): number {
    return this.listForRole(role).filter((item) => !this.readIds.has(item.id)).length;
  }

  isRead(id: string): boolean {
    return this.readIds.has(id);
  }

  markRead(id: string): void {
    if (this.readIds.has(id)) {
      return;
    }
    this.readIds.add(id);
    this.persistReadState();
  }

  markAllRead(role: UserRole): void {
    for (const item of this.listForRole(role)) {
      this.readIds.add(item.id);
    }
    this.persistReadState();
  }

  private isVisibleForRole(item: Announcement, role: UserRole): boolean {
    if (role === 'manager') {
      return true;
    }
    if (role === 'trainer') {
      return item.audience === 'all' || item.audience === 'tr';
    }
    return item.audience === 'all' || item.audience === 'mem';
  }

  private persistReadState(): void {
    const ids = [...this.readIds];
    this.storage.set(READ_KEY, ids);
    this.readSubject.next(new Set(ids));
  }
}
