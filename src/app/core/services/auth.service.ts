import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthUser, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

const SESSION_KEY = 'gg_auth_session';

const DEMO_USER: AuthUser = {
  name: 'Артём Волков',
  email: 'demo@gachago.kz',
  initials: 'АВ',
};

interface AuthSession {
  user: AuthUser;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly session = this.storage.get<AuthSession | null>(SESSION_KEY, null);

  readonly currentRole$ = new BehaviorSubject<UserRole>(this.session?.role ?? 'member');
  readonly currentUser$ = new BehaviorSubject<AuthUser | null>(this.session?.user ?? null);

  isLoggedIn(): boolean {
    return this.currentUser$.value !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser$.value;
  }

  getFirstName(): string {
    const name = this.currentUser$.value?.name ?? DEMO_USER.name;
    return name.split(' ')[0] ?? name;
  }

  login(email: string, password: string): boolean {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password.trim()) {
      return false;
    }

    const user: AuthUser =
      trimmedEmail === DEMO_USER.email
        ? DEMO_USER
        : {
            name: DEMO_USER.name,
            email: trimmedEmail,
            initials: this.initialsFromName(DEMO_USER.name),
          };

    this.setSession(user, 'member');
    void this.router.navigateByUrl('/member/home');
    return true;
  }

  register(name: string, email: string, password: string): boolean {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail || password.length < 6) {
      return false;
    }

    this.setSession(
      {
        name: trimmedName,
        email: trimmedEmail,
        initials: this.initialsFromName(trimmedName),
      },
      'member',
    );
    void this.router.navigateByUrl('/member/home');
    return true;
  }

  logout(): void {
    this.currentUser$.next(null);
    this.currentRole$.next('member');
    this.storage.remove(SESSION_KEY);
    void this.router.navigateByUrl('/login');
  }

  switchRole(role: UserRole): void {
    this.currentRole$.next(role);
    this.persistSession();
    const routes: Record<UserRole, string> = {
      member: '/member/home',
      trainer: '/trainer/students',
      manager: '/manager/posts',
    };
    void this.router.navigateByUrl(routes[role]);
  }

  getCurrentRole(): UserRole {
    return this.currentRole$.value;
  }

  getAppHomePath(): string {
    const routes: Record<UserRole, string> = {
      member: '/member/home',
      trainer: '/trainer/students',
      manager: '/manager/posts',
    };
    return routes[this.getCurrentRole()];
  }

  updateProfile(name: string, email: string): boolean {
    const user = this.currentUser$.value;
    if (!user) {
      return false;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail) {
      return false;
    }

    this.setSession(
      {
        name: trimmedName,
        email: trimmedEmail,
        initials: this.initialsFromName(trimmedName),
      },
      this.currentRole$.value,
    );
    return true;
  }

  private setSession(user: AuthUser, role: UserRole): void {
    this.currentUser$.next(user);
    this.currentRole$.next(role);
    this.persistSession();
  }

  private persistSession(): void {
    const user = this.currentUser$.value;
    if (!user) {
      return;
    }
    this.storage.set(SESSION_KEY, { user, role: this.currentRole$.value });
  }

  private initialsFromName(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
