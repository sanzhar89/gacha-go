export type UserRole = 'member' | 'trainer' | 'manager';

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  subtitle: string;
  avatarGradient: string;
  avatarTextColor: string;
  level?: number;
  streak?: number;
}
