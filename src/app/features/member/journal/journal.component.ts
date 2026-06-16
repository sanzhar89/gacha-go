import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../core/services/workout.service';
import { JournalExercise, WorkoutHistoryEntry } from '../../../core/models/workout.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';

@Component({
  selector: 'app-member-journal',
  standalone: true,
  imports: [FormsModule, DecimalPipe, AsyncPipe, ModalComponent, SelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent {
  private readonly workoutService = inject(WorkoutService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly history$ = this.workoutService.workoutHistory$;

  workoutType = 'Силовая';
  focus = 'Грудь и трицепс';
  durationMin = '65';
  calories = '540';
  distanceKm = '';
  exercises: JournalExercise[] = [
    { name: 'Жим лёжа', sets: '4', reps: '8', weight: '60кг' },
    { name: 'Жим гантелей', sets: '3', reps: '12', weight: '22кг' },
  ];

  exerciseModalOpen = false;
  editModalOpen = false;
  deleteModalOpen = false;
  editingId: string | null = null;

  exName = '';
  exSets = '3';
  exReps = '10';
  exWeight = '';

  editType = '';
  editFocus = '';
  editDuration = '';
  editCalories = '';
  editDistance = '';

  readonly workoutTypes = [
    'Силовая',
    'Кардио',
    'HIIT / Функционал',
    'Бег',
    'Растяжка / Мобильность',
  ];

  openExerciseModal(): void {
    this.exName = '';
    this.exSets = '3';
    this.exReps = '10';
    this.exWeight = '';
    this.exerciseModalOpen = true;
    this.cdr.markForCheck();
  }

  addExercise(): void {
    if (!this.exName.trim()) {
      return;
    }
    this.exercises = [
      ...this.exercises,
      {
        name: this.exName.trim(),
        sets: this.exSets,
        reps: this.exReps,
        weight: this.exWeight,
      },
    ];
    this.exerciseModalOpen = false;
    this.cdr.markForCheck();
  }

  removeExercise(index: number): void {
    this.exercises = this.exercises.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  exerciseDetail(ex: JournalExercise): string {
    const parts = [];
    if (ex.sets && ex.reps) {
      parts.push(`${ex.sets}×${ex.reps}`);
    }
    if (ex.weight) {
      parts.push(ex.weight);
    }
    return parts.join(' · ') || '—';
  }

  saveWorkout(): void {
    const now = new Date();
    const dateIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const duration = Number(this.durationMin) || 0;
    const xp = this.workoutService.calcXp(duration, this.exercises.length);

    const entry: WorkoutHistoryEntry = {
      id: `w-${Date.now()}`,
      type: this.workoutType,
      title: `${this.workoutType} · ${this.focus}`,
      date: this.workoutService.formatDateLabel(dateIso),
      dateIso,
      time,
      durationMin: duration,
      calories: Number(this.calories) || 0,
      exerciseCount: this.exercises.length,
      xp,
      iconType: this.workoutService.iconTypeForWorkout(this.workoutType),
      focus: this.focus,
      exercises: [...this.exercises],
    };

    if (this.distanceKm) {
      entry.distanceKm = Number(this.distanceKm.replace(',', '.'));
    }

    this.workoutService.addWorkout(entry);
    this.cdr.markForCheck();
  }

  openEdit(entry: WorkoutHistoryEntry): void {
    this.editingId = entry.id;
    this.editType = entry.type;
    this.editFocus = entry.focus ?? entry.title.split('·')[1]?.trim() ?? '';
    this.editDuration = String(entry.durationMin);
    this.editCalories = String(entry.calories);
    this.editDistance = entry.distanceKm ? String(entry.distanceKm) : '';
    this.editModalOpen = true;
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (!this.editingId) {
      return;
    }
    this.workoutService.updateWorkout(this.editingId, {
      type: this.editType,
      title: `${this.editType} · ${this.editFocus}`,
      focus: this.editFocus,
      durationMin: Number(this.editDuration) || 0,
      calories: Number(this.editCalories) || 0,
      distanceKm: this.editDistance ? Number(this.editDistance.replace(',', '.')) : undefined,
      iconType: this.workoutService.iconTypeForWorkout(this.editType),
    });
    this.editModalOpen = false;
    this.editingId = null;
    this.cdr.markForCheck();
  }

  confirmDelete(id: string): void {
    this.editingId = id;
    this.deleteModalOpen = true;
    this.cdr.markForCheck();
  }

  deleteEntry(): void {
    if (this.editingId) {
      this.workoutService.deleteWorkout(this.editingId);
    }
    this.deleteModalOpen = false;
    this.editingId = null;
    this.cdr.markForCheck();
  }
}
