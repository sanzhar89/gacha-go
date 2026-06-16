import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  CalendarWorkout,
  DayPlan,
  Exercise,
  JournalExercise,
  MemberProgress,
  PersonalRecord,
  TodayPlan,
  WeekPlan,
  WorkoutHistoryEntry,
} from '../models/workout.model';
import { StorageService } from './storage.service';

const KEYS = {
  history: 'gg_workout_history',
  progress: 'gg_member_progress',
  studentPlans: 'gg_student_week_plans',
  todayCompletion: 'gg_today_completion',
};

const DAY_BY_DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const;
export const DEFAULT_MEMBER_STUDENT_ID = 'artem';

const DEFAULT_PROGRESS: MemberProgress = {
  level: 12,
  currentXp: 1360,
  targetXp: 2000,
  streakDays: 14,
  streakRecord: 31,
  weekWorkouts: 4,
  weekWorkoutsTarget: 5,
  weekCalories: 3240,
  weekTimeHours: 5.2,
  weekDistanceKm: 12.4,
};

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly storage = inject(StorageService);

  private readonly historySubject = new BehaviorSubject<WorkoutHistoryEntry[]>(
    this.storage.get(KEYS.history, this.seedHistory()),
  );
  private readonly progressSubject = new BehaviorSubject<MemberProgress>(
    this.storage.get(KEYS.progress, DEFAULT_PROGRESS),
  );
  private readonly studentPlansSubject = new BehaviorSubject<Record<string, WeekPlan>>(
    this.storage.get(KEYS.studentPlans, { [DEFAULT_MEMBER_STUDENT_ID]: this.buildDefaultWeekPlan() }),
  );
  private readonly todayCompletionSubject = new BehaviorSubject<Record<string, boolean>>(
    this.storage.get(KEYS.todayCompletion, { '1': true, '2': true }),
  );
  private readonly todayPlanSubject = new BehaviorSubject<TodayPlan>(this.buildTodayPlan());

  readonly workoutHistory$ = this.historySubject.asObservable();
  readonly memberProgress$ = this.progressSubject.asObservable();
  readonly studentWeekPlans$ = this.studentPlansSubject.asObservable();
  readonly todayPlan$ = this.todayPlanSubject.asObservable();

  readonly personalRecords: PersonalRecord[] = [
    { label: '🏆 Жим лёжа', value: '72,5', unit: 'кг', change: 'личный рекорд · +5 кг' },
    { label: '🏆 Присед', value: '110', unit: 'кг', change: 'личный рекорд · +10 кг' },
    { label: '🏆 Становая', value: '140', unit: 'кг', change: 'личный рекорд · +7,5 кг' },
    { label: '🏃 5 км бег', value: '24:10', change: 'лучшее время · −48 сек' },
  ];

  get workoutHistory(): WorkoutHistoryEntry[] {
    return this.historySubject.value;
  }

  get memberProgress(): MemberProgress {
    return this.progressSubject.value;
  }

  get todayPlan(): TodayPlan {
    return this.todayPlanSubject.value;
  }

  getWeekPlan(studentId: string): WeekPlan {
    return (
      this.studentPlansSubject.value[studentId] ??
      this.studentPlansSubject.value[DEFAULT_MEMBER_STUDENT_ID] ??
      this.buildDefaultWeekPlan()
    );
  }

  /** @deprecated use getWeekPlan(studentId) */
  get weekPlan(): WeekPlan {
    return this.getWeekPlan(DEFAULT_MEMBER_STUDENT_ID);
  }

  readonly weekPlan$ = this.studentPlansSubject.asObservable();

  get weeklyCalories(): number[] {
    return this.computeWeeklyBuckets('calories');
  }

  get weeklyFrequency(): number[] {
    return this.computeWeeklyBuckets('count');
  }

  updateStudentDayPlan(studentId: string, dayKey: string, plan: DayPlan): void {
    const plans = { ...this.studentPlansSubject.value };
    const week = { ...(plans[studentId] ?? this.buildDefaultWeekPlan()), [dayKey]: plan };
    plans[studentId] = week;
    this.studentPlansSubject.next(plans);
    this.storage.set(KEYS.studentPlans, plans);
    if (studentId === DEFAULT_MEMBER_STUDENT_ID) {
      this.refreshTodayPlan();
    }
  }

  /** @deprecated */
  updateDayPlan(dayKey: string, plan: DayPlan): void {
    this.updateStudentDayPlan(DEFAULT_MEMBER_STUDENT_ID, dayKey, plan);
  }

  duplicateWeek(studentId: string, sourceDay: string): void {
    const source = this.getWeekPlan(studentId)[sourceDay];
    if (!source) {
      return;
    }
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const week = { ...this.getWeekPlan(studentId) };
    for (const day of days) {
      if (day !== sourceDay) {
        week[day] = {
          focus: source.focus,
          exercises: source.exercises.map((ex) => ({ ...ex, id: crypto.randomUUID() })),
        };
      }
    }
    const plans = { ...this.studentPlansSubject.value, [studentId]: week };
    this.studentPlansSubject.next(plans);
    this.storage.set(KEYS.studentPlans, plans);
  }

  toggleTodayExercise(exerciseId: string): void {
    const completion = { ...this.todayCompletionSubject.value };
    completion[exerciseId] = !completion[exerciseId];
    this.todayCompletionSubject.next(completion);
    this.storage.set(KEYS.todayCompletion, completion);
    this.refreshTodayPlan();
  }

  addWorkout(entry: WorkoutHistoryEntry): void {
    const history = [entry, ...this.historySubject.value];
    this.historySubject.next(history);
    this.storage.set(KEYS.history, history);
    this.applyWorkoutToProgress(entry);
  }

  updateWorkout(id: string, updates: Partial<WorkoutHistoryEntry>): void {
    const history = this.historySubject.value.map((e) => (e.id === id ? { ...e, ...updates } : e));
    this.historySubject.next(history);
    this.storage.set(KEYS.history, history);
  }

  deleteWorkout(id: string): void {
    const history = this.historySubject.value.filter((e) => e.id !== id);
    this.historySubject.next(history);
    this.storage.set(KEYS.history, history);
  }

  getCalendarWorkout(year: number, month: number, day: number): CalendarWorkout | null {
    const iso = this.toIso(year, month, day);
    const entry = this.historySubject.value.find((e) => e.dateIso === iso);
    if (!entry) {
      return null;
    }
    return {
      day,
      title: entry.title,
      type: entry.type,
      duration: `${entry.durationMin} мин`,
      calories: entry.calories,
    };
  }

  isWorkoutDay(year: number, month: number, day: number): boolean {
    const iso = this.toIso(year, month, day);
    return this.historySubject.value.some((e) => e.dateIso === iso);
  }

  isToday(year: number, month: number, day: number): boolean {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
  }

  getMonthWorkoutCount(year: number, month: number): number {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return this.historySubject.value.filter((e) => e.dateIso.startsWith(prefix)).length;
  }

  formatDateLabel(iso: string): string {
    const today = this.toIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    if (iso === today) {
      return `Сегодня, ${this.formatRuDate(iso)}`;
    }
    return this.formatRuDate(iso);
  }

  calcXp(durationMin: number, exerciseCount: number): number {
    return Math.round(80 + durationMin * 0.5 + exerciseCount * 10);
  }

  iconTypeForWorkout(type: string): WorkoutHistoryEntry['iconType'] {
    if (type === 'Бег' || type === 'Кардио') {
      return 'run';
    }
    if (type.includes('HIIT') || type.includes('Функционал')) {
      return 'hiit';
    }
    return 'strength';
  }

  private applyWorkoutToProgress(entry: WorkoutHistoryEntry): void {
    const p = { ...this.progressSubject.value };
    p.currentXp += entry.xp;
    if (p.currentXp >= p.targetXp) {
      p.level += 1;
      p.currentXp -= p.targetXp;
      p.targetXp = Math.round(p.targetXp * 1.15);
    }
    p.streakDays += 1;
    p.streakRecord = Math.max(p.streakRecord, p.streakDays);
    p.weekWorkouts = Math.min(p.weekWorkouts + 1, p.weekWorkoutsTarget + 2);
    p.weekCalories += entry.calories;
    p.weekTimeHours = Math.round((p.weekTimeHours + entry.durationMin / 60) * 10) / 10;
    if (entry.distanceKm) {
      p.weekDistanceKm = Math.round((p.weekDistanceKm + entry.distanceKm) * 10) / 10;
    }
    this.progressSubject.next(p);
    this.storage.set(KEYS.progress, p);
  }

  private refreshTodayPlan(): void {
    this.todayPlanSubject.next(this.buildTodayPlan());
  }

  private buildTodayPlan(): TodayPlan {
    const dayKey = DAY_BY_DOW[new Date().getDay()];
    const dayPlan = this.getWeekPlan(DEFAULT_MEMBER_STUDENT_ID)[dayKey];
    const completion = this.todayCompletionSubject.value;
    if (!dayPlan) {
      return {
        trainerName: 'Данияр Касымов',
        focus: 'Отдых',
        exercises: [],
        trainerNote: 'Сегодня день восстановления.',
      };
    }
    return {
      trainerName: 'Данияр Касымов',
      focus: dayPlan.focus,
      exercises: dayPlan.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        weight: ex.weight,
        completed: !!completion[ex.id],
      })),
      trainerNote:
        dayPlan.focus === 'Грудь и трицепс'
          ? 'Следи за техникой в жиме — лопатки сведены, не разгибай локти до конца. Если 60 кг идут легко на все 4 подхода, в следующий раз добавим 2,5 кг.'
          : `Фокус дня: ${dayPlan.focus}. Выполняй упражнения в указанном порядке.`,
    };
  }

  private computeWeeklyBuckets(field: 'calories' | 'count'): number[] {
    const buckets = [0, 0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    for (const entry of this.historySubject.value) {
      const d = new Date(entry.dateIso);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      const weekIndex = 7 - Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 8) {
        buckets[weekIndex] += field === 'calories' ? entry.calories : 1;
      }
    }
    return buckets;
  }

  private seedHistory(): WorkoutHistoryEntry[] {
    const y = 2026;
    const m = 5;
    return [
      {
        id: '1',
        type: 'Силовая',
        title: 'Силовая · Грудь и трицепс',
        date: 'Сегодня, 15 июня',
        dateIso: this.toIso(y, m, 15),
        time: '18:30',
        durationMin: 65,
        calories: 540,
        exerciseCount: 4,
        xp: 120,
        iconType: 'strength',
        focus: 'Грудь и трицепс',
      },
      {
        id: '2',
        type: 'Бег',
        title: 'Бег · интервалы',
        date: '13 июня',
        dateIso: this.toIso(y, m, 13),
        time: '07:40',
        durationMin: 42,
        calories: 480,
        distanceKm: 7.2,
        xp: 95,
        iconType: 'run',
      },
      {
        id: '3',
        type: 'Силовая',
        title: 'Силовая · Ноги',
        date: '11 июня',
        dateIso: this.toIso(y, m, 11),
        time: '19:10',
        durationMin: 72,
        calories: 610,
        exerciseCount: 5,
        xp: 135,
        iconType: 'strength',
        focus: 'Ноги',
      },
      {
        id: '4',
        type: 'HIIT',
        title: 'HIIT · Функционал',
        date: '9 июня',
        dateIso: this.toIso(y, m, 9),
        time: '18:00',
        durationMin: 38,
        calories: 520,
        rounds: 6,
        xp: 110,
        iconType: 'hiit',
      },
    ];
  }

  private toIso(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private formatRuDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  buildDefaultWeekPlan(): WeekPlan {
    return {
      Пн: {
        focus: 'Грудь и трицепс',
        exercises: [
          {
            id: '1',
            name: 'Жим штанги лёжа',
            sets: '4',
            reps: '8',
            rest: '120 сек',
            weight: '60 кг',
            notes: 'Лопатки сведены',
          },
          {
            id: '2',
            name: 'Жим гантелей под углом',
            sets: '3',
            reps: '12',
            rest: '90 сек',
            weight: '22 кг',
          },
          {
            id: '3',
            name: 'Французский жим',
            sets: '3',
            reps: '12',
            rest: '75 сек',
            weight: '25 кг',
          },
          {
            id: '4',
            name: 'Отжимания на брусьях',
            sets: '3',
            reps: 'max',
            rest: '90 сек',
            weight: 'свой вес',
          },
        ],
      },
      Вт: {
        focus: 'Спина и бицепс',
        exercises: [
          { id: '5', name: 'Подтягивания', sets: '4', reps: '10', rest: '90с', notes: '' },
          { id: '6', name: 'Тяга штанги в наклоне', sets: '4', reps: '10', rest: '120с', notes: '' },
        ],
      },
      Ср: {
        focus: 'Кардио · восстановление',
        exercises: [
          { id: '9', name: 'Бег лёгкий', sets: '—', reps: '30 мин', rest: '—', notes: '' },
        ],
      },
      Чт: {
        focus: 'Ноги',
        exercises: [
          { id: '11', name: 'Присед со штангой', sets: '5', reps: '5', rest: '180с', notes: '' },
        ],
      },
      Пт: {
        focus: 'Плечи и пресс',
        exercises: [
          { id: '15', name: 'Жим штанги стоя', sets: '4', reps: '8', rest: '120с', notes: '' },
        ],
      },
      Сб: {
        focus: 'Функционал · HIIT',
        exercises: [
          { id: '19', name: 'Берпи', sets: '5', reps: '15', rest: '60с', notes: '' },
        ],
      },
      Вс: {
        focus: 'Отдых',
        exercises: [
          { id: '22', name: 'Прогулка', sets: '—', reps: '8 000 шагов', rest: '—', notes: '' },
        ],
      },
    };
  }
}

export type { JournalExercise };
