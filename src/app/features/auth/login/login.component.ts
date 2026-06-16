import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: '../auth-shared.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  email = 'demo@gachago.kz';
  password = '';
  readonly error = signal('');

  submit(): void {
    if (!this.auth.login(this.email, this.password)) {
      this.error.set('Введите email и пароль');
      return;
    }
    this.error.set('');
  }
}
