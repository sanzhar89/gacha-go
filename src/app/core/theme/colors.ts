import { ThemeMode } from '../services/theme.service';

export const APP_COLORS_DARK = {
  accent: '#4D8DFF',
  accentMuted: '#2563EB',
  accentWarm: '#8B5CF6',
  accentCool: '#22D3EE',
  accentInverse: '#0a0a0a',
  surfaceMuted: '#34363d',
} as const;

export const APP_COLORS_LIGHT = {
  accent: '#2563EB',
  accentMuted: '#1D4ED8',
  accentWarm: '#7C3AED',
  accentCool: '#0891B2',
  accentInverse: '#ffffff',
  surfaceMuted: '#d8dce8',
} as const;

/** @deprecated use colorsForTheme */
export const GG_COLORS = APP_COLORS_DARK;

export function colorsForTheme(mode: ThemeMode) {
  return mode === 'light' ? APP_COLORS_LIGHT : APP_COLORS_DARK;
}

export function gradientsForTheme(mode: ThemeMode) {
  const c = colorsForTheme(mode);
  return {
    strength: `linear-gradient(135deg, #1e3a8a, ${c.accent})`,
    cardio: `linear-gradient(135deg, #0e7490, ${c.accentCool})`,
    hiit: `linear-gradient(135deg, #5b21b6, ${c.accentWarm})`,
    warm: `linear-gradient(135deg, #6d28d9, ${c.accentWarm})`,
    cool: `linear-gradient(135deg, #155e75, ${c.accentCool})`,
    neutral: 'linear-gradient(135deg, #3c3e45, #555)',
  } as const;
}

export const GG_GRADIENTS = gradientsForTheme('dark');

export function workoutColorsForTheme(mode: ThemeMode): Record<string, string> {
  const c = colorsForTheme(mode);
  return {
    'Силовая': c.accent,
    'Кардио / бег': c.accentCool,
    HIIT: c.accentWarm,
  };
}

export const GG_WORKOUT_COLORS = workoutColorsForTheme('dark');
