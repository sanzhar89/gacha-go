import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerStudent } from '../../../core/models/student.model';
import { StudentsService } from '../../../core/services/students.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  SelectFieldComponent,
  SelectOption,
} from '../../../shared/components/select-field/select-field.component';

@Component({
  selector: 'app-trainer-students',
  standalone: true,
  imports: [RouterLink, FormsModule, AsyncPipe, ModalComponent, SelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent {
  private readonly studentsService = inject(StudentsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly students$ = this.studentsService.students$;

  formOpen = false;
  messageOpen = false;
  deleteOpen = false;
  editing: TrainerStudent | null = null;
  messaging: TrainerStudent | null = null;
  deleting: TrainerStudent | null = null;

  formCandidateId = '';
  formName = '';
  formGoal = '';
  formLevel = 8;
  formEmail = '';
  messageText = '';

  get candidateOptions(): SelectOption[] {
    return this.studentsService.getAddCandidates().map((candidate) => ({
      value: candidate.id,
      label: `${candidate.name} · LVL ${candidate.level}`,
    }));
  }

  get subtitle(): string {
    const total = this.studentsService.students.length;
    const active = this.studentsService.activeCount;
    return `${total} человек · ${active} активны на этой неделе`;
  }

  openAdd(): void {
    this.editing = null;
    this.formCandidateId = '';
    this.formName = '';
    this.formGoal = '';
    this.formLevel = 8;
    this.formEmail = '';
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  onCandidateSelected(candidateId: string): void {
    this.formCandidateId = candidateId;
    const candidate = this.studentsService.getCandidate(candidateId);
    if (!candidate) {
      return;
    }
    this.formName = candidate.name;
    this.formGoal = candidate.goal;
    this.formLevel = candidate.level;
    this.formEmail = candidate.email;
    this.cdr.markForCheck();
  }

  openEdit(student: TrainerStudent): void {
    this.editing = student;
    this.formName = student.name;
    this.formGoal = student.goal;
    this.formLevel = student.level;
    this.formEmail = student.email ?? '';
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  saveStudent(): void {
    if (this.editing) {
      if (!this.formName.trim() || !this.formGoal.trim()) {
        return;
      }
      const initials = this.studentsService.initialsFromName(this.formName);
      this.studentsService.updateStudent(this.editing.id, {
        name: this.formName.trim(),
        goal: this.formGoal.trim(),
        level: this.formLevel,
        initials,
        email: this.formEmail.trim() || undefined,
      });
    } else {
      const candidate = this.studentsService.getCandidate(this.formCandidateId);
      if (!candidate) {
        return;
      }
      this.studentsService.addStudent({
        id: candidate.id,
        name: candidate.name,
        initials: candidate.initials,
        goal: this.formGoal.trim() || candidate.goal,
        level: candidate.level,
        active: true,
        completion: 70,
        streak: 0,
        weekProgress: '0/3',
        avatarGradient: candidate.avatarGradient,
        avatarTextColor: candidate.avatarTextColor,
        email: candidate.email,
      });
    }
    this.formOpen = false;
    this.cdr.markForCheck();
  }

  openMessage(student: TrainerStudent): void {
    this.messaging = student;
    this.messageText = `Привет, ${student.name.split(' ')[0]}! Давно не виделись на тренировках — всё в порядке?`;
    this.messageOpen = true;
    this.cdr.markForCheck();
  }

  sendMessage(): void {
    this.messageOpen = false;
    this.messaging = null;
    this.cdr.markForCheck();
  }

  confirmDelete(student: TrainerStudent): void {
    this.deleting = student;
    this.deleteOpen = true;
    this.cdr.markForCheck();
  }

  deleteStudent(): void {
    if (this.deleting) {
      this.studentsService.deleteStudent(this.deleting.id);
    }
    this.deleteOpen = false;
    this.deleting = null;
    this.cdr.markForCheck();
  }
}
