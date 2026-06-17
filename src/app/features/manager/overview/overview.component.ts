import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GG_COLORS, GG_GRADIENTS } from '../../../core/theme/colors';

interface Kpi {
  label: string;
  value: string;
  sublabel: string;
  accent?: boolean;
}

interface AttendanceDay {
  label: string;
  value: number;
  heightPercent: number;
  highlight?: boolean;
}

interface Membership {
  name: string;
  count: number;
  barPercent: number;
  color: string;
}

interface StaffMember {
  initials: string;
  name: string;
  gradient: string;
  textColor: string;
  specialization: string;
  students: number;
  completion: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  readonly kpis: Kpi[] = [
    { label: 'Всего участников', value: '342', sublabel: '+18 за месяц', accent: true },
    { label: 'Активны за месяц', value: '287', sublabel: '84% базы', accent: true },
    { label: 'Тренеров', value: '8', sublabel: 'в среднем 36 учеников' },
    { label: 'Продлений в июне', value: '64', sublabel: 'retention 91%', accent: true },
  ];

  readonly attendance: AttendanceDay[] = [
    { label: 'Пн', value: 142, heightPercent: 75 },
    { label: 'Вт', value: 128, heightPercent: 67 },
    { label: 'Ср', value: 156, heightPercent: 82 },
    { label: 'Чт', value: 134, heightPercent: 70 },
    { label: 'Пт', value: 178, heightPercent: 93, highlight: true },
    { label: 'Сб', value: 98, heightPercent: 51 },
    { label: 'Вс', value: 64, heightPercent: 34 },
  ];

  readonly memberships: Membership[] = [
    { name: 'Безлимит + тренер', count: 148, barPercent: 80, color: GG_COLORS.accent },
    { name: 'Безлимит', count: 112, barPercent: 60, color: GG_COLORS.accentCool },
    { name: '8 посещений', count: 58, barPercent: 31, color: GG_COLORS.accentWarm },
    { name: 'Разовые', count: 24, barPercent: 13, color: '#555' },
  ];

  readonly staff: StaffMember[] = [
    {
      initials: 'ДК',
      name: 'Данияр Касымов',
      gradient: GG_GRADIENTS.strength,
      textColor: GG_COLORS.accentInverse,
      specialization: 'Силовой тренинг',
      students: 42,
      completion: '88%',
    },
    {
      initials: 'АН',
      name: 'Аружан Нурлан',
      gradient: GG_GRADIENTS.hiit,
      textColor: GG_COLORS.accentInverse,
      specialization: 'Функционал · HIIT',
      students: 38,
      completion: '81%',
    },
    {
      initials: 'ТМ',
      name: 'Тимур Мадиев',
      gradient: GG_GRADIENTS.cool,
      textColor: GG_COLORS.accentInverse,
      specialization: 'Нутрициология',
      students: 29,
      completion: '90%',
    },
    {
      initials: 'КЖ',
      name: 'Камила Жунус',
      gradient: GG_GRADIENTS.warm,
      textColor: GG_COLORS.accentInverse,
      specialization: 'Мобильность · йога',
      students: 31,
      completion: '85%',
    },
  ];
}
