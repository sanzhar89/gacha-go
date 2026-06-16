import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANDING_COACHES } from '../../core/data/landing-content';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

@Component({
  selector: 'app-coaches',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coaches.component.html',
  styleUrl: './coaches.component.scss',
})
export class CoachesComponent {
  readonly coaches = LANDING_COACHES;
}
