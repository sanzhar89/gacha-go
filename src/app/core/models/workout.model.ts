export interface JournalExercise {
  name: string;
  sets?: string;
  reps?: string;
  weight?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  weight?: string;
  completed?: boolean;
}

export interface TodayPlan {
  trainerName: string;
  focus: string;
  exercises: Exercise[];
  trainerNote: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  dateIso: string;
  time: string;
  durationMin: number;
  calories: number;
  distanceKm?: number;
  exerciseCount?: number;
  rounds?: number;
  xp: number;
  iconType: 'strength' | 'run' | 'hiit';
  focus?: string;
  exercises?: JournalExercise[];
}

export interface MemberProgress {
  level: number;
  currentXp: number;
  targetXp: number;
  streakDays: number;
  streakRecord: number;
  weekWorkouts: number;
  weekWorkoutsTarget: number;
  weekCalories: number;
  weekTimeHours: number;
  weekDistanceKm: number;
}

export interface CalendarWorkout {
  day: number;
  title: string;
  type: string;
  duration: string;
  calories: number;
}

export interface DayPlan {
  focus: string;
  exercises: Exercise[];
}

export interface WeekPlan {
  [dayKey: string]: DayPlan;
}

export interface PersonalRecord {
  label: string;
  value: string;
  unit?: string;
  change: string;
}
