import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScheduleDay, ScheduleSession } from '../../../core/models/schedule.model';
import { ScheduleService } from '../../../core/services/schedule.service';
import { StudentsService } from '../../../core/services/students.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  SelectFieldComponent,
  SelectOption,
} from '../../../shared/components/select-field/select-field.component';

const SESSION_TYPES = ['Силовая', 'Кардио', 'HIIT', 'Функционал', 'Тонус'] as const;

@Component({
  selector: 'app-trainer-schedule',
  standalone: true,
  imports: [FormsModule, AsyncPipe, ModalComponent, SelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent {
  private readonly scheduleService = inject(ScheduleService);
  private readonly studentsService = inject(StudentsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly weekDays$ = this.scheduleService.weekDays$;
  readonly students = this.studentsService.students;
  readonly sessionTypeOptions = [...SESSION_TYPES];

  formOpen = false;
  deleteOpen = false;
  editingDayKey = 'mon';
  editingSession: ScheduleSession | null = null;
  deleting: { dayKey: string; session: ScheduleSession } | null = null;

  formStudentId = 'artem';
  formTime = '09:00';
  formDuration = '60 мин';
  formType: (typeof SESSION_TYPES)[number] = 'Силовая';

  get studentOptions(): SelectOption[] {
    return this.students.map((student) => ({
      value: student.id,
      label: student.name,
    }));
  }

  get totalSessions(): number {
    return this.scheduleService.totalSessions;
  }

  openAdd(dayKey: string): void {
    this.editingSession = null;
    this.editingDayKey = dayKey;
    this.formStudentId = this.students[0]?.id ?? 'artem';
    this.formTime = '09:00';
    this.formDuration = '60 мин';
    this.formType = 'Силовая';
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(dayKey: string, session: ScheduleSession): void {
    this.editingDayKey = dayKey;
    this.editingSession = session;
    this.formStudentId = session.studentId;
    this.formTime = session.time;
    this.formDuration = session.duration;
    this.formType = session.type as (typeof SESSION_TYPES)[number];
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  saveSession(): void {
    if (!this.formStudentId || !this.formTime.trim()) {
      return;
    }
    if (this.editingSession) {
      this.scheduleService.updateSession(this.editingDayKey, this.editingSession.id, {
        studentId: this.formStudentId,
        time: this.formTime.trim(),
        duration: this.formDuration.trim(),
        type: this.formType,
      });
    } else {
      this.scheduleService.addSession(this.editingDayKey, {
        studentId: this.formStudentId,
        time: this.formTime.trim(),
        duration: this.formDuration.trim(),
        type: this.formType,
      });
    }
    this.formOpen = false;
    this.cdr.markForCheck();
  }

  confirmDelete(dayKey: string, session: ScheduleSession): void {
    this.deleting = { dayKey, session };
    this.deleteOpen = true;
    this.cdr.markForCheck();
  }

  deleteSession(): void {
    if (this.deleting) {
      this.scheduleService.deleteSession(this.deleting.dayKey, this.deleting.session.id);
    }
    this.deleteOpen = false;
    this.deleting = null;
    this.cdr.markForCheck();
  }

  isToday(day: ScheduleDay): boolean {
    const dow = new Date().getDay();
    const map: Record<number, string> = {
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
      0: 'sun',
    };
    return day.key === map[dow];
  }
}
