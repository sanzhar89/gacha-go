export interface ScheduleSession {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  time: string;
  duration: string;
  type: string;
  gradient: string;
  textColor: string;
}

export interface ScheduleDay {
  key: string;
  label: string;
  fullName: string;
  sessions: ScheduleSession[];
}
