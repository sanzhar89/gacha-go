import { GG_GRADIENTS } from '../theme/colors';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Post, PostCategory } from '../models/post.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'gg_posts';

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    title: 'Прогрессия нагрузок: как расти без плато',
    category: 'Тренировки',
    excerpt: '👁 1 284 просмотра · автор: Данияр Касымов',
    date: '12 июня 2026',
    status: 'published',
    author: 'Данияр Касымов',
    views: 1284,
    coverGradient: 'linear-gradient(135deg,#0e1a33,#c2410c)',
  },
  {
    id: '2',
    title: 'Белок на массонаборе: сколько и когда',
    category: 'Питание',
    excerpt: '👁 936 просмотров · автор: Тимур Мадиев',
    date: '8 июня 2026',
    status: 'published',
    author: 'Тимур Мадиев',
    views: 936,
    coverGradient: GG_GRADIENTS.hiit,
  },
  {
    id: '3',
    title: '120 дней серии: история Артёма',
    category: 'Истории',
    excerpt: '👁 2 107 просмотров · автор: редакция',
    date: '2 июня 2026',
    status: 'published',
    author: 'редакция',
    views: 2107,
    coverGradient: GG_GRADIENTS.strength,
  },
  {
    id: '4',
    title: 'Летнее расписание групповых тренировок',
    category: 'Новости зала',
    excerpt: 'не опубликовано',
    date: 'изменено вчера',
    status: 'draft',
    author: 'редакция',
    coverGradient: '#2a2c32',
  },
];

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly storage = inject(StorageService);

  private readonly postsSubject = new BehaviorSubject<Post[]>(
    this.storage.get(STORAGE_KEY, DEFAULT_POSTS),
  );

  readonly posts$ = this.postsSubject.asObservable();

  readonly categories: PostCategory[] = ['Тренировки', 'Питание', 'Истории', 'Новости зала'];

  readonly coverPresets = [
    'linear-gradient(135deg,#0e1a33,#c2410c)',
    GG_GRADIENTS.hiit,
    GG_GRADIENTS.strength,
    GG_GRADIENTS.cool,
    '#2a2c32',
  ];

  get posts(): Post[] {
    return this.postsSubject.value;
  }

  addPost(post: Post): void {
    this.persist([post, ...this.posts]);
  }

  updatePost(id: string, updates: Partial<Post>): void {
    this.persist(this.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  deletePost(id: string): void {
    this.persist(this.posts.filter((p) => p.id !== id));
  }

  private persist(posts: Post[]): void {
    this.postsSubject.next(posts);
    this.storage.set(STORAGE_KEY, posts);
  }
}
