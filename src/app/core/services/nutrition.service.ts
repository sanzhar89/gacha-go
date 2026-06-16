import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Meal, NutritionPlan } from '../models/nutrition.model';
import { DEFAULT_MEMBER_STUDENT_ID } from './workout.service';
import { StorageService } from './storage.service';

const PLANS_KEY = 'gg_nutrition_plans';
const PROGRESS_KEY = 'gg_nutrition_progress';

interface NutritionProgress {
  caloriesEaten: number;
  macrosProgress: { protein: number; fat: number; carbs: number };
  loggedMealIds: string[];
}

function defaultPlan(goal = 'набор массы'): NutritionPlan {
  return {
    caloriesTarget: 2850,
    caloriesEaten: 1920,
    macros: { protein: 180, fat: 80, carbs: 320 },
    macrosProgress: { protein: 128, fat: 58, carbs: 240 },
    assignedBy: 'Тимур Мадиев',
    assignedDate: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    goal,
    meals: [
      {
        id: '1',
        name: 'Завтрак',
        emoji: '🌅',
        calories: 640,
        items: [
          { name: 'Овсянка на молоке, 80 г', portion: '80 г', calories: 320 },
          { name: 'Яйца варёные, 3 шт', portion: '3 шт', calories: 215 },
          { name: 'Банан', portion: '1 шт', calories: 105 },
        ],
      },
      {
        id: '2',
        name: 'Обед',
        emoji: '☀️',
        calories: 820,
        items: [
          { name: 'Куриная грудка, 200 г', portion: '200 г', calories: 330 },
          { name: 'Гречка отварная, 150 г', portion: '150 г', calories: 200 },
          { name: 'Овощной салат с маслом', portion: '200 г', calories: 290 },
        ],
      },
      {
        id: '3',
        name: 'Перекус',
        emoji: '🥤',
        calories: 390,
        items: [
          { name: 'Творог 5%, 200 г', portion: '200 г', calories: 240 },
          { name: 'Грецкие орехи, 20 г', portion: '20 г', calories: 150 },
        ],
      },
      {
        id: '4',
        name: 'Ужин',
        emoji: '🌙',
        calories: 0,
        items: [],
        planned: true,
        plannedCalories: 1000,
      },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private readonly storage = inject(StorageService);

  private readonly plansSubject = new BehaviorSubject<Record<string, NutritionPlan>>(
    this.storage.get(PLANS_KEY, {
      artem: defaultPlan('набор массы'),
      madina: defaultPlan('похудение'),
      ruslan: defaultPlan('сила'),
      elena: defaultPlan('тонус'),
    }),
  );

  private readonly progressSubject = new BehaviorSubject<NutritionProgress>(
    this.storage.get(PROGRESS_KEY, {
      caloriesEaten: 1920,
      macrosProgress: { protein: 128, fat: 58, carbs: 240 },
      loggedMealIds: ['1', '2', '3'],
    }),
  );

  private readonly memberPlanSubject = new BehaviorSubject<NutritionPlan>(
    this.mergePlanWithProgress(DEFAULT_MEMBER_STUDENT_ID),
  );

  readonly nutritionPlan$ = this.memberPlanSubject.asObservable();

  constructor() {
    this.plansSubject.subscribe(() => this.refreshMemberPlan());
    this.progressSubject.subscribe(() => this.refreshMemberPlan());
  }

  get nutritionPlan(): NutritionPlan {
    return this.memberPlanSubject.value;
  }

  getPlanForStudent(studentId: string): NutritionPlan {
    return structuredClone(this.plansSubject.value[studentId] ?? defaultPlan());
  }

  updateStudentPlan(studentId: string, plan: NutritionPlan): void {
    const plans = { ...this.plansSubject.value, [studentId]: plan };
    this.plansSubject.next(plans);
    this.storage.set(PLANS_KEY, plans);
    if (studentId === DEFAULT_MEMBER_STUDENT_ID) {
      this.refreshMemberPlan();
    }
  }

  updatePlan(plan: NutritionPlan): void {
    this.updateStudentPlan(DEFAULT_MEMBER_STUDENT_ID, plan);
  }

  toggleMealLogged(mealId: string): void {
    const progress = { ...this.progressSubject.value };
    const plan = this.getPlanForStudent(DEFAULT_MEMBER_STUDENT_ID);
    const meal = plan.meals.find((m) => m.id === mealId);
    if (!meal || meal.planned) {
      return;
    }
    const logged = new Set(progress.loggedMealIds);
    if (logged.has(mealId)) {
      logged.delete(mealId);
      progress.caloriesEaten -= meal.calories;
    } else {
      logged.add(mealId);
      progress.caloriesEaten += meal.calories;
    }
    progress.loggedMealIds = [...logged];
    progress.macrosProgress = this.estimateMacros(progress.caloriesEaten, plan);
    this.progressSubject.next(progress);
    this.storage.set(PROGRESS_KEY, progress);
    this.refreshMemberPlan();
  }

  isMealLogged(mealId: string): boolean {
    return this.progressSubject.value.loggedMealIds.includes(mealId);
  }

  private refreshMemberPlan(): void {
    this.memberPlanSubject.next(this.mergePlanWithProgress(DEFAULT_MEMBER_STUDENT_ID));
  }

  private mergePlanWithProgress(studentId: string): NutritionPlan {
    const plan = structuredClone(this.plansSubject.value[studentId] ?? defaultPlan());
    const progress = this.progressSubject.value;
    plan.caloriesEaten = progress.caloriesEaten;
    plan.macrosProgress = { ...progress.macrosProgress };
    return plan;
  }

  private estimateMacros(
    calories: number,
    plan: NutritionPlan,
  ): { protein: number; fat: number; carbs: number } {
    const ratio = Math.min(calories / plan.caloriesTarget, 1);
    return {
      protein: Math.round(plan.macros.protein * ratio),
      fat: Math.round(plan.macros.fat * ratio),
      carbs: Math.round(plan.macros.carbs * ratio),
    };
  }
}
