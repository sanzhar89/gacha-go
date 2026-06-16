import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-switcher.component.html',
  styleUrl: './role-switcher.component.scss',
})
export class RoleSwitcherComponent {
  private readonly auth = inject(AuthService);

  readonly currentRole$ = this.auth.currentRole$;

  readonly roles: { role: UserRole; label: string }[] = [
    { role: 'member', label: 'Участник' },
    { role: 'trainer', label: 'Тренер' },
    { role: 'manager', label: 'Управляющий' },
  ];

  switch(role: UserRole): void {
    this.auth.switchRole(role);
  }
}
