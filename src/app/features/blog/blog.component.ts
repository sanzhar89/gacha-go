import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANDING_BLOG_POSTS } from '../../core/data/landing-content';
import { PublicHeaderComponent } from '../../shared/components/public-header/public-header.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, PublicHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  readonly blogPosts = LANDING_BLOG_POSTS;
}
