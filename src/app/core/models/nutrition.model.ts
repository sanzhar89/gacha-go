export interface MacroTargets {
  protein: number;
  fat: number;
  carbs: number;
}

export interface MacroProgress {
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  items: MealItem[];
  planned?: boolean;
  plannedCalories?: number;
}

export interface NutritionPlan {
  caloriesTarget: number;
  caloriesEaten: number;
  macros: MacroTargets;
  macrosProgress: MacroProgress;
  assignedBy: string;
  assignedDate: string;
  goal: string;
  meals: Meal[];
}
