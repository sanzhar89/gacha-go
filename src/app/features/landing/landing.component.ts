import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LANDING_BLOG_POSTS,
  LANDING_COACHES,
  LANDING_PATHS,
  LANDING_PROGRAMS,
  LANDING_STATS,
} from '../../core/data/landing-content';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

const PROGRAM_AUTO_MS = 4500;
const PROGRAM_GAP = 20;
const PROGRAM_SCROLL_MS = 560;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly coaches = LANDING_COACHES;
  readonly blogPosts = LANDING_BLOG_POSTS;
  readonly paths = LANDING_PATHS;
  readonly stats = LANDING_STATS;
  readonly loopPrograms = Array.from({ length: 3 }, (_, copy) =>
    LANDING_PROGRAMS.map((program) => ({
      ...program,
      loopKey: `${program.id}-${copy}`,
    })),
  ).flat();

  readonly selectedCoachIndex = signal(0);
  readonly headerScrolled = signal(false);
  readonly showScrollTop = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly programTrack = viewChild<ElementRef<HTMLElement>>('programTrack');

  private programAutoPaused = false;
  private programAnimating = false;
  private programPendingDirection: 'prev' | 'next' | null = null;
  private programScrollToken = 0;
  private programManualTimer: ReturnType<typeof setTimeout> | null = null;
  private programFinishTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    afterNextRender(() => {
      const track = this.programTrack()?.nativeElement;
      if (track) {
        requestAnimationFrame(() => {
          const setWidth = this.getProgramSetWidth(track);
          if (setWidth) {
            track.scrollLeft = setWidth;
          }
        });

        const onManualScroll = (): void => {
          if (this.programAnimating) return;

          if (this.programManualTimer) {
            clearTimeout(this.programManualTimer);
          }

          this.programManualTimer = setTimeout(() => this.normalizeProgramScroll(), 160);
        };

        track.addEventListener('scroll', onManualScroll, { passive: true });

        this.destroyRef.onDestroy(() => {
          track.removeEventListener('scroll', onManualScroll);
          if (this.programManualTimer) {
            clearTimeout(this.programManualTimer);
          }
          if (this.programFinishTimer) {
            clearTimeout(this.programFinishTimer);
          }
        });
      }

      const timer = setInterval(() => {
        if (!this.programAutoPaused && !this.programAnimating) {
          this.scrollPrograms('next');
        }
      }, PROGRAM_AUTO_MS);

      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  get loginLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/login';
  }

  get startLink(): string {
    return this.auth.isLoggedIn() ? this.auth.getAppHomePath() : '/register';
  }

  selectCoach(index: number): void {
    this.selectedCoachIndex.set(index);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.headerScrolled.set(window.scrollY > 48);
    this.showScrollTop.set(window.scrollY > 480);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  pauseProgramAuto(): void {
    this.programAutoPaused = true;
  }

  resumeProgramAuto(): void {
    this.programAutoPaused = false;
  }

  scrollPrograms(direction: 'prev' | 'next'): void {
    if (this.programAnimating) {
      this.programPendingDirection = direction;
      return;
    }

    this.runProgramScroll(direction);
  }

  private runProgramScroll(direction: 'prev' | 'next'): void {
    const track = this.programTrack()?.nativeElement;
    if (!track) return;

    const step = this.getProgramStep(track);
    const setWidth = this.getProgramSetWidth(track);
    if (!step || !setWidth) return;

    this.programAnimating = true;
    const token = ++this.programScrollToken;

    if (this.programFinishTimer) {
      clearTimeout(this.programFinishTimer);
    }

    if (direction === 'prev' && track.scrollLeft <= setWidth + 10) {
      this.jumpProgramScroll(track, track.scrollLeft + setWidth);
    }

    const finish = (): void => this.finishProgramScroll(track, token);
    track.addEventListener('scrollend', finish, { once: true });
    this.programFinishTimer = setTimeout(finish, PROGRAM_SCROLL_MS);

    track.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
  }

  private finishProgramScroll(track: HTMLElement, token: number): void {
    if (token !== this.programScrollToken || !this.programAnimating) return;

    if (this.programFinishTimer) {
      clearTimeout(this.programFinishTimer);
      this.programFinishTimer = null;
    }

    this.normalizeProgramScroll();
    this.programAnimating = false;

    const pending = this.programPendingDirection;
    this.programPendingDirection = null;

    if (pending) {
      requestAnimationFrame(() => this.runProgramScroll(pending));
    }
  }

  private getProgramStep(track: HTMLElement): number {
    const card = track.querySelector<HTMLElement>('.gg-program-card');
    return card ? card.offsetWidth + PROGRAM_GAP : 0;
  }

  private getProgramSetWidth(track: HTMLElement): number {
    const step = this.getProgramStep(track);
    return step * LANDING_PROGRAMS.length;
  }

  private jumpProgramScroll(track: HTMLElement, left: number): void {
    const prevSnap = track.style.scrollSnapType;
    const prevBehavior = track.style.scrollBehavior;
    track.style.scrollSnapType = 'none';
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = left;
    track.style.scrollBehavior = prevBehavior;
    track.style.scrollSnapType = prevSnap;
  }

  private normalizeProgramScroll(): void {
    const track = this.programTrack()?.nativeElement;
    if (!track) return;

    const setWidth = this.getProgramSetWidth(track);
    if (!setWidth) return;

    if (track.scrollLeft >= setWidth * 2 - 2) {
      this.jumpProgramScroll(track, track.scrollLeft - setWidth);
    } else if (track.scrollLeft < setWidth - 2) {
      this.jumpProgramScroll(track, track.scrollLeft + setWidth);
    }
  }
}
