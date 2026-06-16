import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, ShellConfig } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { NAV_ICONS } from '../../shared/nav-icons';

@Component({
  selector: 'app-trainer-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trainer-shell.component.html',
  styleUrl: './trainer-shell.component.scss',
})
export class TrainerShellComponent {
  readonly config: ShellConfig = {
    roleLabel: 'Тренер',
    userName: 'Данияр Касымов',
    userSubtitle: 'Силовой тренинг',
    userInitials: 'ДК',
    avatarGradient: 'linear-gradient(135deg, #4d8dff, #2e6be6)',
    avatarTextColor: '#0a0d14',
    navItems: [
      { label: 'Ученики', route: '/trainer/students', icon: NAV_ICONS.students },
      { label: 'Конструктор тренировок', route: '/trainer/workout-builder', icon: NAV_ICONS.workout },
      { label: 'Конструктор питания', route: '/trainer/nutrition-builder', icon: NAV_ICONS.nutrition },
      { label: 'Расписание', route: '/trainer/schedule', icon: NAV_ICONS.schedule },
    ],
    roleLinks: [
      { label: 'Кабинет участника', role: 'member' },
      { label: 'Кабинет управляющего', role: 'manager' },
    ],
  };
}
