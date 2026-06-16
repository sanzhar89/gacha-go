import { ChangeDetectionStrategy, Component, inject } from '@angular/core';import { toSignal } from '@angular/core/rxjs-interop';
import { NutritionService } from '../../../core/services/nutrition.service';

@Component({
  selector: 'app-member-nutrition',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.scss',
})
export class NutritionComponent {
  private readonly nutritionService = inject(NutritionService);

  readonly plan = toSignal(this.nutritionService.nutritionPlan$, {
    initialValue: this.nutritionService.nutritionPlan,
  });

  caloriesProgress(plan: { caloriesEaten: number; caloriesTarget: number }): number {
    return Math.round((plan.caloriesEaten / plan.caloriesTarget) * 100);
  }

  macroPercent(current: number, target: number): number {
    return Math.round((current / target) * 100);
  }

  formatNumber(value: number): string {
    return value.toLocaleString('ru-RU');
  }

  isMealLogged(mealId: string): boolean {
    return this.nutritionService.isMealLogged(mealId);
  }

  toggleMeal(mealId: string): void {
    this.nutritionService.toggleMealLogged(mealId);
  }
}
