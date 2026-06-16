import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANDING_BLOG_POSTS, LANDING_COACHES } from '../../core/data/landing-content';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);

  readonly coaches = LANDING_COACHES;
  readonly blogPosts = LANDING_BLOG_POSTS;

  get loginLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/login';
  }

  get startLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/register';
  }
}
