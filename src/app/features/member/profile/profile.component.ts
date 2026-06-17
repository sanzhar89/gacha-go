import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LANDING_PATHS } from '../../../core/data/landing-content';
import { AuthService } from '../../../core/services/auth.service';
import { WorkoutService } from '../../../core/services/workout.service';
import { GG_COLORS, GG_GRADIENTS } from '../../../core/theme/colors';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { XpBarComponent } from '../../../shared/components/xp-bar/xp-bar.component';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [FormsModule, RouterLink, ThemeToggleComponent, XpBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly workoutService = inject(WorkoutService);

  private readonly user = toSignal(this.auth.currentUser$, { initialValue: null });
  readonly progress = toSignal(this.workoutService.memberProgress$, {
    initialValue: this.workoutService.memberProgress,
  });
  readonly todayPlan = toSignal(this.workoutService.todayPlan$, {
    initialValue: this.workoutService.todayPlan,
  });

  readonly avatarGradient = GG_GRADIENTS.strength;
  readonly avatarTextColor = GG_COLORS.accentInverse;
  readonly leagues = LANDING_PATHS;

  readonly editName = signal('');
  readonly editEmail = signal('');
  readonly saveMessage = signal('');
  readonly saveError = signal(false);

  readonly profile = computed(() => {
    const user = this.user();
    const p = this.progress();
    return {
      name: user?.name ?? 'Артём Волков',
      email: user?.email ?? 'demo@gachago.kz',
      initials: user?.initials ?? 'АВ',
      level: p.level,
      currentXp: p.currentXp,
      targetXp: p.targetXp,
      streakDays: p.streakDays,
      streakRecord: p.streakRecord,
      weekWorkouts: p.weekWorkouts,
      memberSince: 'Март 2026',
      goal: 'Набор массы',
      trainer: this.todayPlan().trainerName,
    };
  });

  readonly xpPercent = computed(() => {
    const p = this.progress();
    return Math.round((p.currentXp / p.targetXp) * 100);
  });

  constructor() {
    const user = this.auth.getCurrentUser();
    this.editName.set(user?.name ?? 'Артём Волков');
    this.editEmail.set(user?.email ?? 'demo@gachago.kz');
  }

  saveProfile(): void {
    this.saveMessage.set('');
    this.saveError.set(false);

    const ok = this.auth.updateProfile(this.editName(), this.editEmail());
    if (ok) {
      this.saveMessage.set('Изменения сохранены');
    } else {
      this.saveError.set(true);
      this.saveMessage.set('Заполните имя и email');
    }
  }
}
