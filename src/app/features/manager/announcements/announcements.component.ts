import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnnouncementAudience } from '../../../core/models/announcement.model';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

type Audience = AnnouncementAudience;

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [FormsModule, AsyncPipe, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss',
})
export class AnnouncementsComponent {
  private readonly announcementsService = inject(AnnouncementsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly announcements$ = this.announcementsService.announcements$;

  audience: Audience = 'all';
  title = '';
  message = '';
  pushEnabled = true;
  emailEnabled = false;

  previewOpen = false;
  deleteOpen = false;
  deletingId: string | null = null;

  readonly audienceOptions: { id: Audience; label: string; count: number }[] = [
    { id: 'all', label: 'Все', count: 342 },
    { id: 'mem', label: 'Участники', count: 334 },
    { id: 'tr', label: 'Тренеры', count: 8 },
  ];

  selectAudience(id: Audience): void {
    this.audience = id;
  }

  isAudienceActive(id: Audience): boolean {
    return this.audience === id;
  }

  togglePush(): void {
    this.pushEnabled = !this.pushEnabled;
  }

  toggleEmail(): void {
    this.emailEnabled = !this.emailEnabled;
  }

  openPreview(): void {
    if (!this.title.trim() || !this.message.trim()) {
      return;
    }
    this.previewOpen = true;
    this.cdr.markForCheck();
  }

  send(): void {
    if (!this.title.trim() || !this.message.trim()) {
      return;
    }
    this.announcementsService.send({
      audience: this.audience,
      title: this.title,
      message: this.message,
      pushEnabled: this.pushEnabled,
      emailEnabled: this.emailEnabled,
    });
    this.title = '';
    this.message = '';
    this.previewOpen = false;
    this.cdr.markForCheck();
  }

  confirmDelete(id: string): void {
    this.deletingId = id;
    this.deleteOpen = true;
    this.cdr.markForCheck();
  }

  deleteAnnouncement(): void {
    if (this.deletingId) {
      this.announcementsService.delete(this.deletingId);
    }
    this.deleteOpen = false;
    this.deletingId = null;
    this.cdr.markForCheck();
  }

  audienceLabel(id: Audience): string {
    return this.audienceOptions.find((o) => o.id === id)?.label ?? id;
  }
}
