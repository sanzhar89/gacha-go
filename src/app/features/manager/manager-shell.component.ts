import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, ShellConfig } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { NAV_ICONS } from '../../shared/nav-icons';
import { GG_COLORS, GG_GRADIENTS } from '../../core/theme/colors';

@Component({
  selector: 'app-manager-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manager-shell.component.html',
  styleUrl: './manager-shell.component.scss',
})
export class ManagerShellComponent {
  readonly config: ShellConfig = {
    roleLabel: 'Управляющий',
    userName: 'Сауле Аманова',
    userSubtitle: 'Управляющая',
    userInitials: 'СА',
    avatarGradient: GG_GRADIENTS.warm,
    avatarTextColor: GG_COLORS.accentInverse,
    navItems: [
      { label: 'Редактор постов', route: '/manager/posts', icon: NAV_ICONS.posts },
      { label: 'Объявления', route: '/manager/announcements', icon: NAV_ICONS.announcements },
      { label: 'Обзор зала', route: '/manager/overview', icon: NAV_ICONS.overview },
    ],
    roleLinks: [
      { label: 'Кабинет участника', role: 'member' },
      { label: 'Кабинет тренера', role: 'trainer' },
    ],
  };
}
