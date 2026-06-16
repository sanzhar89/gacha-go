import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WorkoutService } from '../../../core/services/workout.service';
import { CalendarWorkout } from '../../../core/models/workout.model';

interface CalendarDay {
  day: number;
  inMonth: boolean;
}

@Component({
  selector: 'app-member-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly workoutService = inject(WorkoutService);

  private readonly progress = toSignal(this.workoutService.memberProgress$, {
    initialValue: this.workoutService.memberProgress,
  });
  private readonly history = toSignal(this.workoutService.workoutHistory$, {
    initialValue: this.workoutService.workoutHistory,
  });

  readonly weekdayLabels = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  readonly monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  readonly todayYear = new Date().getFullYear();
  readonly todayMonth = new Date().getMonth();
  readonly todayDay = new Date().getDate();

  viewYear = this.todayYear;
  viewMonth = this.todayMonth;
  selectedDay: number | null = this.todayDay;

  readonly monthGoal = 18;

  readonly monthWorkouts = computed(() =>
    this.workoutService.getMonthWorkoutCount(this.viewYear, this.viewMonth),
  );

  readonly streakDays = computed(() => this.progress().streakDays);
  readonly streakRecord = computed(() => this.progress().streakRecord);

  readonly loadDistribution = computed(() => {
    const prefix = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}`;
    const entries = this.history().filter((e) => e.dateIso.startsWith(prefix));
    const counts: Record<string, number> = {};
    for (const e of entries) {
      const key =
        e.type === 'Бег' || e.type === 'Кардио'
          ? 'Кардио / бег'
          : e.type === 'HIIT' || e.type.includes('Функционал')
            ? 'HIIT'
            : 'Силовая';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const colors: Record<string, string> = {
      'Силовая': '#4d8dff',
      'Кардио / бег': '#ff9a6b',
      HIIT: '#FF7849',
    };
    return Object.entries(counts).map(([label, count]) => ({
      label,
      color: colors[label] ?? '#4d8dff',
      count,
    }));
  });

  get monthLabel(): string {
    return `${this.monthNames[this.viewMonth]} ${this.viewYear}`;
  }

  readonly monthProgress = computed(() =>
    Math.round((this.monthWorkouts() / this.monthGoal) * 100),
  );

  get calendarDays(): CalendarDay[] {
    const firstWeekday = this.getMondayBasedWeekday(this.viewYear, this.viewMonth, 1);
    const daysInMonth = this.getDaysInMonth(this.viewYear, this.viewMonth);
    const cells: CalendarDay[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ day: 0, inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, inMonth: true });
    }

    return cells;
  }

  get selectedWorkout(): CalendarWorkout | null {
    if (this.selectedDay === null) {
      return null;
    }
    return this.workoutService.getCalendarWorkout(
      this.viewYear,
      this.viewMonth,
      this.selectedDay,
    );
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear -= 1;
    } else {
      this.viewMonth -= 1;
    }
    this.selectedDay = null;
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear += 1;
    } else {
      this.viewMonth += 1;
    }
    this.selectedDay = null;
  }

  selectDay(day: number): void {
    this.selectedDay = day;
  }

  isToday(day: number): boolean {
    return this.workoutService.isToday(this.viewYear, this.viewMonth, day);
  }

  isWorkoutDay(day: number): boolean {
    return this.workoutService.isWorkoutDay(this.viewYear, this.viewMonth, day);
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  private getMondayBasedWeekday(year: number, month: number, day: number): number {
    const weekday = new Date(year, month, day).getDay();
    return weekday === 0 ? 6 : weekday - 1;
  }
}
