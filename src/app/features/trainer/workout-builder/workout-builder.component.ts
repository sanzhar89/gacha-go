import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DayPlan, Exercise } from '../../../core/models/workout.model';
import { StudentsService } from '../../../core/services/students.service';
import { WorkoutService } from '../../../core/services/workout.service';

const DAY_KEYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const DAY_FULL: Record<string, string> = {
  Пн: 'Понедельник',
  Вт: 'Вторник',
  Ср: 'Среда',
  Чт: 'Четверг',
  Пт: 'Пятница',
  Сб: 'Суббота',
  Вс: 'Воскресенье',
};

@Component({
  selector: 'app-workout-builder',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workout-builder.component.html',
  styleUrl: './workout-builder.component.scss',
})
export class WorkoutBuilderComponent implements OnInit {
  private readonly workoutService = inject(WorkoutService);
  private readonly studentsService = inject(StudentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly dayKeys = DAY_KEYS;
  readonly dayFull = DAY_FULL;

  readonly students = this.studentsService.students.map((s) => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    gradient: s.avatarGradient,
  }));

  selectedDay = 'Пн';
  selectedStudentId = 'artem';
  focus = '';
  exercises: Exercise[] = [];
  saved = false;

  ngOnInit(): void {
    const studentParam = this.route.snapshot.queryParamMap.get('student');
    if (studentParam && this.students.some((s) => s.id === studentParam)) {
      this.selectedStudentId = studentParam;
    }
    this.loadDay();
  }

  selectDay(day: string): void {
    this.selectedDay = day;
    this.saved = false;
    this.loadDay();
    this.cdr.markForCheck();
  }

  selectStudent(id: string): void {
    this.selectedStudentId = id;
    this.saved = false;
    this.loadDay();
    this.cdr.markForCheck();
  }

  isDayActive(day: string): boolean {
    return this.selectedDay === day;
  }

  isStudentActive(id: string): boolean {
    return this.selectedStudentId === id;
  }

  get dayName(): string {
    return this.dayFull[this.selectedDay] ?? this.selectedDay;
  }

  get exerciseCountLabel(): string {
    const n = this.exercises.length;
    if (n === 1) return '1 упражнение';
    if (n >= 2 && n <= 4) return `${n} упражнения`;
    return `${n} упражнений`;
  }

  addExercise(): void {
    this.exercises = [
      ...this.exercises,
      {
        id: crypto.randomUUID(),
        name: '',
        sets: '3',
        reps: '10',
        rest: '90с',
        notes: '',
      },
    ];
    this.cdr.markForCheck();
  }

  removeExercise(index: number): void {
    this.exercises = this.exercises.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  duplicateWeek(): void {
    this.workoutService.duplicateWeek(this.selectedStudentId, this.selectedDay);
    this.saved = true;
    this.cdr.markForCheck();
  }

  savePlan(): void {
    const plan: DayPlan = {
      focus: this.focus,
      exercises: this.exercises.map((ex) => ({ ...ex })),
    };
    this.workoutService.updateStudentDayPlan(this.selectedStudentId, this.selectedDay, plan);
    this.saved = true;
    this.cdr.markForCheck();
  }

  private loadDay(): void {
    const plan = this.workoutService.getWeekPlan(this.selectedStudentId)[this.selectedDay];
    if (!plan) {
      this.focus = '';
      this.exercises = [];
      return;
    }
    this.focus = plan.focus;
    this.exercises = plan.exercises.map((ex) => ({ ...ex }));
  }
}
