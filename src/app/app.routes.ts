import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'coaches',
    loadComponent: () =>
      import('./features/coaches/coaches.component').then((m) => m.CoachesComponent),
  },
  {
    path: 'blog',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/blog/blog.component').then((m) => m.BlogComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/blog/blog-article.component').then((m) => m.BlogArticleComponent),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'member',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/member/member-shell.component').then((m) => m.MemberShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/member/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'journal',
        loadComponent: () =>
          import('./features/member/journal/journal.component').then((m) => m.JournalComponent),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/member/calendar/calendar.component').then((m) => m.CalendarComponent),
      },
      {
        path: 'nutrition',
        loadComponent: () =>
          import('./features/member/nutrition/nutrition.component').then((m) => m.NutritionComponent),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./features/member/progress/progress.component').then((m) => m.ProgressComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/member/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'trainer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/trainer/trainer-shell.component').then((m) => m.TrainerShellComponent),
    children: [
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/trainer/students/students.component').then((m) => m.StudentsComponent),
      },
      {
        path: 'workout-builder',
        loadComponent: () =>
          import('./features/trainer/workout-builder/workout-builder.component').then(
            (m) => m.WorkoutBuilderComponent,
          ),
      },
      {
        path: 'nutrition-builder',
        loadComponent: () =>
          import('./features/trainer/nutrition-builder/nutrition-builder.component').then(
            (m) => m.NutritionBuilderComponent,
          ),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/trainer/schedule/schedule.component').then((m) => m.ScheduleComponent),
      },
    ],
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/manager/manager-shell.component').then((m) => m.ManagerShellComponent),
    children: [
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
      {
        path: 'posts',
        loadComponent: () =>
          import('./features/manager/posts/posts.component').then((m) => m.PostsComponent),
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import('./features/manager/announcements/announcements.component').then(
            (m) => m.AnnouncementsComponent,
          ),
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/manager/overview/overview.component').then((m) => m.OverviewComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
