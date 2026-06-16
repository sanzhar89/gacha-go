export type PostCategory = 'Тренировки' | 'Питание' | 'Истории' | 'Новости зала';

export type PostStatus = 'published' | 'draft';

export interface Post {
  id: string;
  title: string;
  category: PostCategory;
  body?: string;
  excerpt: string;
  date: string;
  status: PostStatus;
  author: string;
  views?: number;
  coverGradient: string;
}
