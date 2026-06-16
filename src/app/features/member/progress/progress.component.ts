import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { WorkoutService } from '../../../core/services/workout.service';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-member-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss',
})
export class ProgressComponent implements AfterViewInit, OnDestroy {
  private readonly workoutService = inject(WorkoutService);

  readonly personalRecords = this.workoutService.personalRecords;

  @ViewChild('caloriesCanvas') caloriesCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('frequencyCanvas') frequencyCanvas?: ElementRef<HTMLCanvasElement>;

  private caloriesChart?: Chart;
  private frequencyChart?: Chart;

  readonly avgFrequency = this.calcAvgFrequency();

  ngAfterViewInit(): void {
    this.initCaloriesChart();
    this.initFrequencyChart();
  }

  ngOnDestroy(): void {
    this.caloriesChart?.destroy();
    this.frequencyChart?.destroy();
  }

  private getLastFourWeeks<T>(data: T[]): T[] {
    return data.slice(-4);
  }

  private weekLabels(count: number, offsetFromEnd: number): string[] {
    const start = 8 - offsetFromEnd - count + 1;
    return Array.from({ length: count }, (_, i) => `Н${start + i}`);
  }

  private calcAvgFrequency(): string {
    const values = this.getLastFourWeeks(this.workoutService.weeklyFrequency);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return avg.toFixed(1).replace('.', ',');
  }

  private initCaloriesChart(): void {
    const canvas = this.caloriesCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const data = this.getLastFourWeeks(this.workoutService.weeklyCalories);
    const labels = this.weekLabels(data.length, 4);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: (ctx) => {
              const index = ctx.dataIndex;
              const isLast = index === data.length - 1;
              const isSecondLast = index === data.length - 2;
              return isLast || isSecondLast ? '#4d8dff' : '#34363d';
            },
            borderRadius: { topLeft: 7, topRight: 7, bottomLeft: 3, bottomRight: 3 },
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2026',
            borderColor: '#2d2f36',
            borderWidth: 1,
            titleColor: '#f4f4f2',
            bodyColor: '#a8a8a8',
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} ккал`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b6b6b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            display: false,
            beginAtZero: true,
          },
        },
      },
    };

    this.caloriesChart = new Chart(canvas, config);
  }

  private initFrequencyChart(): void {
    const canvas = this.frequencyCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const data = this.getLastFourWeeks(this.workoutService.weeklyFrequency);
    const labels = this.weekLabels(data.length, 4);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#4d8dff',
            backgroundColor: 'rgba(77, 141, 255, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#4d8dff',
            pointBorderColor: '#4d8dff',
            pointRadius: 4,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e2026',
            borderColor: '#2d2f36',
            borderWidth: 1,
            titleColor: '#f4f4f2',
            bodyColor: '#a8a8a8',
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} тренировок`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b6b6b', font: { size: 11 } },
            border: { display: false },
          },
          y: {
            display: false,
            beginAtZero: true,
            suggestedMax: 6,
          },
        },
      },
    };

    this.frequencyChart = new Chart(canvas, config);
  }
}
