import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'gg_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  readonly mode = signal<ThemeMode>(this.readStored());
  readonly isDark = computed(() => this.mode() === 'dark');
  readonly accentColor = computed(() => (this.mode() === 'light' ? '#000000' : '#FFFFFF'));

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    this.setTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
    this.storage.set(STORAGE_KEY, mode);
    this.apply(mode);
  }

  private readStored(): ThemeMode {
    const stored = this.storage.get<string | null>(STORAGE_KEY, null);
    return stored === 'light' ? 'light' : 'dark';
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }
}
