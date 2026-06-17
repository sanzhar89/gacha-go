import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { RoleSwitcherComponent } from './shared/components/role-switcher/role-switcher.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RoleSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    @if (showRoleSwitcher) {
      <app-role-switcher />
    }
  `,
  styles: `:host { display: block; }`,
})
export class App {
  private readonly _theme = inject(ThemeService);

  readonly showRoleSwitcher = isDevMode();
}
