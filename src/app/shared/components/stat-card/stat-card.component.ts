import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() suffix = '';
  @Input() sublabel = '';
  @Input() sublabelAccent = false;
}
