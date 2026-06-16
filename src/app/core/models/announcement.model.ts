export type AnnouncementAudience = 'all' | 'mem' | 'tr';

export interface Announcement {
  id: string;
  audience: AnnouncementAudience;
  audienceLabel: string;
  title: string;
  message: string;
  date: string;
  stats: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
}
