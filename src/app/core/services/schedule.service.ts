import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ScheduleDay, ScheduleSession } from '../models/schedule.model';
import { StudentsService } from './students.service';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'gg_schedule';

const DEFAULT_WEEK: ScheduleDay[] = [
  {
    key: 'mon',
    label: 'Пн',
    fullName: 'Понедельник',
    sessions: [
      {
        id: '1',
        studentId: 'artem',
        studentName: 'Артём Волков',
        initials: 'АВ',
        time: '07:00',
        duration: '60 мин',
        type: 'Силовая',
        gradient: 'linear-gradient(135deg, #c2410c, #ff9a6b)',
        textColor: '#fff',
      },
      {
        id: '2',
        studentId: 'ruslan',
        studentName: 'Руслан Тлеуов',
        initials: 'РТ',
        time: '18:30',
        duration: '75 мин',
        type: 'Силовая',
        gradient: 'linear-gradient(135deg, #e0531c, #4d8dff)',
        textColor: '#fff',
      },
    ],
  },
  {
    key: 'tue',
    label: 'Вт',
    fullName: 'Вторник',
    sessions: [
      {
        id: '3',
        studentId: 'madina',
        studentName: 'Мадина Бекова',
        initials: 'МБ',
        time: '10:00',
        duration: '45 мин',
        type: 'Кардио',
        gradient: 'linear-gradient(135deg, #4d8dff, #2e6be6)',
        textColor: '#0a0d14',
      },
    ],
  },
  {
    key: 'wed',
    label: 'Ср',
    fullName: 'Среда',
    sessions: [
      {
        id: '4',
        studentId: 'artem',
        studentName: 'Артём Волков',
        initials: 'АВ',
        time: '07:00',
        duration: '60 мин',
        type: 'Силовая',
        gradient: 'linear-gradient(135deg, #c2410c, #ff9a6b)',
        textColor: '#fff',
      },
      {
        id: '5',
        studentId: 'elena',
        studentName: 'Елена Ким',
        initials: 'ЕК',
        time: '12:00',
        duration: '50 мин',
        type: 'Тонус',
        gradient: 'linear-gradient(135deg, #3c3e45, #555)',
        textColor: '#ccc',
      },
    ],
  },
  {
    key: 'thu',
    label: 'Чт',
    fullName: 'Четверг',
    sessions: [
      {
        id: '6',
        studentId: 'ruslan',
        studentName: 'Руслан Тлеуов',
        initials: 'РТ',
        time: '18:30',
        duration: '80 мин',
        type: 'Силовая',
        gradient: 'linear-gradient(135deg, #e0531c, #4d8dff)',
        textColor: '#fff',
      },
    ],
  },
  {
    key: 'fri',
    label: 'Пт',
    fullName: 'Пятница',
    sessions: [
      {
        id: '7',
        studentId: 'madina',
        studentName: 'Мадина Бекова',
        initials: 'МБ',
        time: '09:30',
        duration: '55 мин',
        type: 'Функционал',
        gradient: 'linear-gradient(135deg, #4d8dff, #2e6be6)',
        textColor: '#0a0d14',
      },
      {
        id: '8',
        studentId: 'artem',
        studentName: 'Артём Волков',
        initials: 'АВ',
        time: '17:00',
        duration: '60 мин',
        type: 'Силовая',
        gradient: 'linear-gradient(135deg, #c2410c, #ff9a6b)',
        textColor: '#fff',
      },
    ],
  },
  {
    key: 'sat',
    label: 'Сб',
    fullName: 'Суббота',
    sessions: [
      {
        id: '9',
        studentId: 'ruslan',
        studentName: 'Руслан Тлеуов',
        initials: 'РТ',
        time: '11:00',
        duration: '40 мин',
        type: 'HIIT',
        gradient: 'linear-gradient(135deg, #e0531c, #4d8dff)',
        textColor: '#fff',
      },
    ],
  },
  { key: 'sun', label: 'Вс', fullName: 'Воскресенье', sessions: [] },
];

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly storage = inject(StorageService);
  private readonly students = inject(StudentsService);

  private readonly weekSubject = new BehaviorSubject<ScheduleDay[]>(
    this.storage.get(STORAGE_KEY, DEFAULT_WEEK),
  );

  readonly weekDays$ = this.weekSubject.asObservable();

  get weekDays(): ScheduleDay[] {
    return this.weekSubject.value;
  }

  get totalSessions(): number {
    return this.weekDays.reduce((sum, d) => sum + d.sessions.length, 0);
  }

  addSession(
    dayKey: string,
    data: Omit<ScheduleSession, 'id' | 'studentName' | 'initials' | 'gradient' | 'textColor'>,
  ): void {
    const student = this.students.getStudent(data.studentId);
    if (!student) {
      return;
    }
    const session: ScheduleSession = {
      ...data,
      id: crypto.randomUUID(),
      studentName: student.name,
      initials: student.initials,
      gradient: student.avatarGradient,
      textColor: student.avatarTextColor,
    };
    this.updateWeek(
      this.weekDays.map((day) =>
        day.key === dayKey ? { ...day, sessions: [...day.sessions, session] } : day,
      ),
    );
  }

  updateSession(dayKey: string, sessionId: string, updates: Partial<ScheduleSession>): void {
    this.updateWeek(
      this.weekDays.map((day) => {
        if (day.key !== dayKey) {
          return day;
        }
        return {
          ...day,
          sessions: day.sessions.map((s) => {
            if (s.id !== sessionId) {
              return s;
            }
            const merged = { ...s, ...updates };
            if (updates.studentId) {
              const student = this.students.getStudent(updates.studentId);
              if (student) {
                merged.studentName = student.name;
                merged.initials = student.initials;
                merged.gradient = student.avatarGradient;
                merged.textColor = student.avatarTextColor;
              }
            }
            return merged;
          }),
        };
      }),
    );
  }

  deleteSession(dayKey: string, sessionId: string): void {
    this.updateWeek(
      this.weekDays.map((day) =>
        day.key === dayKey
          ? { ...day, sessions: day.sessions.filter((s) => s.id !== sessionId) }
          : day,
      ),
    );
  }

  private updateWeek(days: ScheduleDay[]): void {
    this.weekSubject.next(days);
    this.storage.set(STORAGE_KEY, days);
  }
}
