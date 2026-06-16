export interface TrainerStudent {
  id: string;
  name: string;
  initials: string;
  goal: string;
  level: number;
  active: boolean;
  inactiveLabel?: string;
  completion: number;
  streak: number;
  weekProgress: string;
  avatarGradient: string;
  avatarTextColor: string;
  dimmed?: boolean;
  email?: string;
}

export interface StudentCandidate {
  id: string;
  name: string;
  initials: string;
  email: string;
  level: number;
  goal: string;
  avatarGradient: string;
  avatarTextColor: string;
}
