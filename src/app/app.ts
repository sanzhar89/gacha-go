import { ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  readonly showRoleSwitcher = isDevMode();
}
