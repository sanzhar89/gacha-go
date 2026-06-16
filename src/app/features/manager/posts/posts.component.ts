import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { Post, PostCategory } from '../../../core/models/post.model';
import { PostsService } from '../../../core/services/posts.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SelectFieldComponent } from '../../../shared/components/select-field/select-field.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule, AsyncPipe, ModalComponent, SelectFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
})
export class PostsComponent {
  private readonly postsService = inject(PostsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categories = this.postsService.categories;
  readonly coverPresets = this.postsService.coverPresets;
  readonly posts$ = this.postsService.posts$;
  readonly stats$ = this.posts$.pipe(
    map((posts) => ({
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
    })),
  );

  title = '';
  category: PostCategory = 'Тренировки';
  body = '';
  coverGradient = this.coverPresets[0];
  publishNow = true;

  editOpen = false;
  deleteOpen = false;
  editing: Post | null = null;
  deleting: Post | null = null;

  editTitle = '';
  editCategory: PostCategory = 'Тренировки';
  editBody = '';
  editCover = this.coverPresets[0];

  saveDraft(): void {
    this.publishNow = false;
    this.submit();
  }

  publish(): void {
    this.publishNow = true;
    this.submit();
  }

  openEdit(post: Post): void {
    this.editing = post;
    this.editTitle = post.title;
    this.editCategory = post.category;
    this.editBody = post.body ?? '';
    this.editCover = post.coverGradient ?? this.coverPresets[0];
    this.editOpen = true;
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (!this.editing || !this.editTitle.trim()) {
      return;
    }
    this.postsService.updatePost(this.editing.id, {
      title: this.editTitle.trim(),
      category: this.editCategory,
      body: this.editBody.trim(),
      coverGradient: this.editCover,
    });
    this.editOpen = false;
    this.editing = null;
    this.cdr.markForCheck();
  }

  confirmDelete(post: Post): void {
    this.deleting = post;
    this.deleteOpen = true;
    this.cdr.markForCheck();
  }

  deletePost(): void {
    if (this.deleting) {
      this.postsService.deletePost(this.deleting.id);
    }
    this.deleteOpen = false;
    this.deleting = null;
    this.cdr.markForCheck();
  }

  toggleStatus(post: Post): void {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    const updates: Partial<Post> = { status: nextStatus };

    if (nextStatus === 'published') {
      updates.excerpt = `👁 ${(post.views ?? 0).toLocaleString('ru-RU')} просмотров · автор: ${post.author}`;
    } else {
      updates.excerpt = 'не опубликовано';
    }

    this.postsService.updatePost(post.id, updates);
  }

  selectCover(preset: string, mode: 'new' | 'edit'): void {
    if (mode === 'new') {
      this.coverGradient = preset;
    } else {
      this.editCover = preset;
    }
    this.cdr.markForCheck();
  }

  private submit(): void {
    if (!this.title.trim()) {
      return;
    }

    const status = this.publishNow ? 'published' : 'draft';
    const post: Post = {
      id: crypto.randomUUID(),
      title: this.title.trim(),
      category: this.category,
      body: this.body.trim(),
      excerpt:
        status === 'published'
          ? '👁 0 просмотров · автор: Сауле Аманова'
          : 'не опубликовано',
      date: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status,
      author: 'Сауле Аманова',
      views: status === 'published' ? 0 : undefined,
      coverGradient: this.coverGradient,
    };

    this.postsService.addPost(post);
    this.title = '';
    this.body = '';
    this.category = 'Тренировки';
    this.coverGradient = this.coverPresets[0];
    this.publishNow = true;
  }
}
