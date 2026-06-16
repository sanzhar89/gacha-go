import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-xp-bar',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './xp-bar.component.html',
  styleUrl: './xp-bar.component.scss',
})
export class XpBarComponent {
  @Input({ required: true }) streakDays = 0;
  @Input({ required: true }) percent = 0;
  @Input() currentXp = 1360;
  @Input() targetXp = 2000;
  @Input() label = 'Прогресс уровня';
  @Input() showStreak = true;
  @Input() shimmerDelay = '1.2s';
}
