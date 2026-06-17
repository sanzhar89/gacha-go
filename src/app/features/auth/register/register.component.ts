import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: '../auth-shared.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  readonly error = signal('');

  submit(): void {
    if (!this.name.trim() || !this.email.trim()) {
      this.error.set('Заполните имя и email');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Пароль — минимум 6 символов');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Пароли не совпадают');
      return;
    }
    if (!this.auth.register(this.name, this.email, this.password)) {
      this.error.set('Не удалось создать аккаунт');
      return;
    }
    this.error.set('');
  }
}
