import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Meal, NutritionPlan } from '../../../core/models/nutrition.model';
import { NutritionService } from '../../../core/services/nutrition.service';
import { StudentsService } from '../../../core/services/students.service';

@Component({
  selector: 'app-nutrition-builder',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition-builder.component.html',
  styleUrl: './nutrition-builder.component.scss',
})
export class NutritionBuilderComponent implements OnInit {
  private readonly nutritionService = inject(NutritionService);
  private readonly studentsService = inject(StudentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly students = this.studentsService.students.map((s) => ({
    id: s.id,
    name: s.name,
    goal: s.goal.toLowerCase(),
  }));

  selectedStudentId = 'artem';
  caloriesTarget = 0;
  protein = 0;
  fat = 0;
  carbs = 0;
  meals: Meal[] = [];
  saved = false;

  ngOnInit(): void {
    const studentParam = this.route.snapshot.queryParamMap.get('student');
    if (studentParam && this.students.some((s) => s.id === studentParam)) {
      this.selectedStudentId = studentParam;
    }
    this.loadPlan();
  }

  get selectedStudent(): { id: string; name: string; goal: string } {
    return this.students.find((s) => s.id === this.selectedStudentId) ?? this.students[0];
  }

  selectStudent(id: string): void {
    this.selectedStudentId = id;
    this.saved = false;
    this.loadPlan();
    this.cdr.markForCheck();
  }

  isStudentActive(id: string): boolean {
    return this.selectedStudentId === id;
  }

  mealCalories(meal: Meal): number {
    return meal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
  }

  addProduct(mealIndex: number): void {
    const meal = this.meals[mealIndex];
    meal.items = [...meal.items, { name: '', portion: '', calories: 0 }];
    this.meals = [...this.meals];
    this.cdr.markForCheck();
  }

  removeProduct(mealIndex: number, itemIndex: number): void {
    const meal = this.meals[mealIndex];
    meal.items = meal.items.filter((_, i) => i !== itemIndex);
    this.meals = [...this.meals];
    this.cdr.markForCheck();
  }

  addMeal(): void {
    this.meals = [
      ...this.meals,
      {
        id: crypto.randomUUID(),
        name: 'Новый приём',
        emoji: '🍽️',
        calories: 0,
        items: [],
      },
    ];
    this.cdr.markForCheck();
  }

  removeMeal(index: number): void {
    this.meals = this.meals.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }

  savePlan(): void {
    const existing = this.nutritionService.getPlanForStudent(this.selectedStudentId);
    const plan: NutritionPlan = {
      ...existing,
      caloriesTarget: this.caloriesTarget,
      macros: { protein: this.protein, fat: this.fat, carbs: this.carbs },
      goal: this.selectedStudent.goal,
      meals: this.meals.map((meal) => ({
        ...meal,
        calories: this.mealCalories(meal),
        items: meal.items.map((item) => ({ ...item })),
      })),
    };
    this.nutritionService.updateStudentPlan(this.selectedStudentId, plan);
    this.saved = true;
    this.cdr.markForCheck();
  }

  private loadPlan(): void {
    const plan = this.nutritionService.getPlanForStudent(this.selectedStudentId);
    this.caloriesTarget = plan.caloriesTarget;
    this.protein = plan.macros.protein;
    this.fat = plan.macros.fat;
    this.carbs = plan.macros.carbs;
    this.meals = plan.meals
      .filter((m) => !m.planned)
      .map((meal) => ({
        ...meal,
        items: meal.items.map((item) => ({ ...item })),
      }));
  }
}
