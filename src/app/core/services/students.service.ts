import { GG_COLORS, GG_GRADIENTS } from '../theme/colors';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StudentCandidate, TrainerStudent } from '../models/student.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'gg_students';

const MEMBER_CATALOG: StudentCandidate[] = [
  {
    id: 'sergey',
    name: 'Сергей Омаров',
    initials: 'СО',
    email: 'sergey.omarov@gachago.kz',
    level: 9,
    goal: 'Сила',
    avatarGradient: GG_GRADIENTS.strength,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'aidana',
    name: 'Айдана Сатбек',
    initials: 'АС',
    email: 'aidana.satbek@gachago.kz',
    level: 5,
    goal: 'Тонус',
    avatarGradient: GG_GRADIENTS.cool,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'nikita',
    name: 'Никита Жумабеков',
    initials: 'НЖ',
    email: 'nikita.zhumabekov@gachago.kz',
    level: 11,
    goal: 'Набор массы',
    avatarGradient: GG_GRADIENTS.cardio,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'dina',
    name: 'Дина Алиева',
    initials: 'ДА',
    email: 'dina.alieva@gachago.kz',
    level: 7,
    goal: 'Похудение',
    avatarGradient: GG_GRADIENTS.warm,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'timur-s',
    name: 'Тимур Сейитов',
    initials: 'ТС',
    email: 'timur.seyitov@gachago.kz',
    level: 10,
    goal: 'Выносливость',
    avatarGradient: GG_GRADIENTS.neutral,
    avatarTextColor: '#f4f4f2',
  },
];

const DEFAULT_STUDENTS: TrainerStudent[] = [
  {
    id: 'artem',
    name: 'Артём Волков',
    initials: 'АВ',
    goal: 'Набор массы',
    level: 12,
    email: 'demo@gachago.kz',
    active: true,
    completion: 92,
    streak: 14,
    weekProgress: '4/5',
    avatarGradient: GG_GRADIENTS.cool,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'madina',
    name: 'Мадина Бекова',
    initials: 'МБ',
    goal: 'Похудение',
    level: 8,
    active: true,
    completion: 86,
    streak: 9,
    weekProgress: '3/4',
    avatarGradient: GG_GRADIENTS.cardio,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'ruslan',
    name: 'Руслан Тлеуов',
    initials: 'РТ',
    goal: 'Сила',
    level: 15,
    active: true,
    completion: 98,
    streak: 27,
    weekProgress: '5/5',
    avatarGradient: GG_GRADIENTS.warm,
    avatarTextColor: GG_COLORS.accentInverse,
  },
  {
    id: 'elena',
    name: 'Елена Ким',
    initials: 'ЕК',
    goal: 'Тонус',
    level: 6,
    active: false,
    inactiveLabel: '5 дней не была',
    completion: 54,
    streak: 0,
    weekProgress: '0/3',
    avatarGradient: 'linear-gradient(135deg, #3c3e45, #555)',
    avatarTextColor: '#ccc',
    dimmed: true,
  },
];

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly storage = inject(StorageService);

  private readonly studentsSubject = new BehaviorSubject<TrainerStudent[]>(
    this.storage.get(STORAGE_KEY, DEFAULT_STUDENTS),
  );

  readonly students$ = this.studentsSubject.asObservable();

  get students(): TrainerStudent[] {
    return this.studentsSubject.value;
  }

  getStudent(id: string): TrainerStudent | undefined {
    return this.students.find((s) => s.id === id);
  }

  get activeCount(): number {
    return this.students.filter((s) => s.active).length;
  }

  getAddCandidates(): StudentCandidate[] {
    const assignedIds = new Set(this.students.map((student) => student.id));
    const assignedNames = new Set(this.students.map((student) => student.name));
    return MEMBER_CATALOG.filter(
      (candidate) => !assignedIds.has(candidate.id) && !assignedNames.has(candidate.name),
    );
  }

  getCandidate(id: string): StudentCandidate | undefined {
    return MEMBER_CATALOG.find((candidate) => candidate.id === id);
  }

  addStudent(data: Omit<TrainerStudent, 'id'> & { id?: string }): TrainerStudent {
    const student: TrainerStudent = {
      ...data,
      id: data.id ?? crypto.randomUUID(),
    };
    this.persist([student, ...this.students]);
    return student;
  }

  updateStudent(id: string, updates: Partial<TrainerStudent>): void {
    this.persist(this.students.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  deleteStudent(id: string): void {
    this.persist(this.students.filter((s) => s.id !== id));
  }

  initialsFromName(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private persist(list: TrainerStudent[]): void {
    this.studentsSubject.next(list);
    this.storage.set(STORAGE_KEY, list);
  }
}
