import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent, ShellConfig } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { NAV_ICONS } from '../../shared/nav-icons';
import { GG_COLORS, GG_GRADIENTS } from '../../core/theme/colors';

@Component({
  selector: 'app-member-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './member-shell.component.html',
  styleUrl: './member-shell.component.scss',
})
export class MemberShellComponent {
  private readonly auth = inject(AuthService);
  private readonly user = toSignal(this.auth.currentUser$, { initialValue: null });

  readonly config = computed<ShellConfig>(() => {
    const user = this.user();
    return {
      userName: user?.name ?? 'Артём Волков',
      userSubtitle: 'LVL 12 · Атлет',
      userInitials: user?.initials ?? 'АВ',
      avatarGradient: GG_GRADIENTS.strength,
      avatarTextColor: GG_COLORS.accentInverse,
      navItems: [
        { label: 'Главная', route: '/member/home', icon: NAV_ICONS.home },
        { label: 'Журнал', route: '/member/journal', icon: NAV_ICONS.journal },
        { label: 'Календарь', route: '/member/calendar', icon: NAV_ICONS.calendar },
        { label: 'Питание', route: '/member/nutrition', icon: NAV_ICONS.nutrition },
        { label: 'Прогресс', route: '/member/progress', icon: NAV_ICONS.progress },
      ],
      roleLinks: [
        { label: 'Кабинет тренера', role: 'trainer' },
        { label: 'Кабинет управляющего', role: 'manager' },
      ],
    };
  });
}
