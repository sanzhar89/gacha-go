import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  inject,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);

  @Input({ required: true }) title = '';
  @Input() streak?: number;
  @Input() badge?: string;
  @Input() badgePulse = false;
  @Input() badgeWarm = false;
  @Input() showNotifications = false;

  panelOpen = false;

  constructor() {
    this.announcementsService.announcements$.subscribe(() => {
      this.cdr.markForCheck();
    });
    this.notificationsService.readState$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  get notifications() {
    return this.notificationsService.listForRole(this.auth.getCurrentRole());
  }

  get unreadCount(): number {
    return this.notificationsService.unreadCount(this.auth.getCurrentRole());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    this.cdr.markForCheck();
  }

  openNotification(id: string): void {
    this.notificationsService.markRead(id);
    this.cdr.markForCheck();
  }

  markAllRead(): void {
    this.notificationsService.markAllRead(this.auth.getCurrentRole());
    this.cdr.markForCheck();
  }

  isUnread(id: string): boolean {
    return !this.notificationsService.isRead(id);
  }

  private closePanel(): void {
    if (!this.panelOpen) {
      return;
    }
    this.panelOpen = false;
    this.cdr.markForCheck();
  }
}
