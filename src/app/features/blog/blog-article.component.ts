import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getBlogPostById } from '../../core/data/landing-content';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-article.component.html',
  styleUrl: './blog-article.component.scss',
})
export class BlogArticleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly post = getBlogPostById(this.route.snapshot.paramMap.get('id') ?? '');

  constructor() {
    if (!this.post) {
      void this.router.navigateByUrl('/blog');
    }
  }
}
