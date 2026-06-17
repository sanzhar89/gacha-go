import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {
  private readonly auth = inject(AuthService);

  get loginLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/login';
  }

  get startLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/register';
  }
}
