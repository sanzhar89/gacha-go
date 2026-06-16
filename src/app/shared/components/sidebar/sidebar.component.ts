import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface ShellConfig {
  roleLabel?: string;
  userName: string;
  userSubtitle: string;
  userInitials: string;
  avatarGradient: string;
  avatarTextColor: string;
  navItems: NavItem[];
  roleLinks: { label: string; role: UserRole }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);

  @Input({ required: true }) config!: ShellConfig;

  switchRole(role: UserRole): void {
    this.auth.switchRole(role);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
