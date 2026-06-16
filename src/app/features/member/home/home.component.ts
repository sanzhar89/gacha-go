import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { XpBarComponent } from '../../../shared/components/xp-bar/xp-bar.component';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [RouterLink, XpBarComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly workoutService = inject(WorkoutService);
  private readonly auth = inject(AuthService);

  private readonly user = toSignal(this.auth.currentUser$, { initialValue: null });
  readonly progress = toSignal(this.workoutService.memberProgress$, {
    initialValue: this.workoutService.memberProgress,
  });
  readonly todayPlan = toSignal(this.workoutService.todayPlan$, {
    initialValue: this.workoutService.todayPlan,
  });

  readonly league = 'Силовая лига · Дивизион II';

  readonly greeting = computed(() => {
    const name = this.user()?.name?.split(' ')[0] ?? 'Артём';
    return `Привет, ${name} 👋`;
  });

  readonly weekStats = computed(() => {
    const p = this.progress();
    return [
      {
        label: 'Тренировки',
        value: String(p.weekWorkouts),
        suffix: `/ ${p.weekWorkoutsTarget}`,
        sublabel: '+1 к прошлой неделе',
        sublabelAccent: true,
      },
      {
        label: 'Калории',
        value: p.weekCalories.toLocaleString('ru-RU'),
        sublabel: 'сожжено ккал',
        sublabelAccent: false,
      },
      {
        label: 'Время',
        value: String(p.weekTimeHours).replace('.', ','),
        suffix: 'ч',
        sublabel: 'под нагрузкой',
        sublabelAccent: false,
      },
      {
        label: 'Дистанция',
        value: String(p.weekDistanceKm).replace('.', ','),
        suffix: 'км',
        sublabel: 'бег + ходьба',
        sublabelAccent: false,
      },
    ];
  });

  readonly xpPercent = computed(() =>
    Math.round((this.progress().currentXp / this.progress().targetXp) * 100),
  );

  toggleExercise(exerciseId: string): void {
    this.workoutService.toggleTodayExercise(exerciseId);
  }
}
