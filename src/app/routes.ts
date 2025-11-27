import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';

export default [
  {
    children: [
      {
        children: [
          {
            loadChildren: () =>
              import('./core/auth/login/routes').then((m) => m.default),
            path: 'login',
          },
          {
            loadChildren: () =>
              import('./core/auth/register/routes').then((m) => m.default),
            path: 'register',
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'login',
          },
        ],
        component: AuthLayoutComponent,
        path: 'auth',
      },

      {
        children: [
          {
            loadChildren: () => import('./modules/ads/routes'),
            path: '',
            pathMatch: 'full',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./modules/ads/add-advertisement/routes'),
            path: 'add-ad',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./modules/ads/edit-advertisement/routes'),
            path: 'edit-ad/:id',
          },
          // ЗАМЕНИТЬ старый маршрут на новый
          {
            loadChildren: () =>
              import('./modules/ad-modules/ad-list-page/routes'),
            path: 'ad/:id',
          },
          {
            canActivate: [AdminGuard],
            loadChildren: () => import('./modules/users/user-list/routes'),
            path: 'users',
          },
          {
            canActivate: [AdminGuard],
            loadChildren: () => import('./modules/users/user-profile/routes'),
            path: 'users/:id',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () => import('./modules/users/user-profile/routes'),
            path: 'profile',
          },
          {
            path: '**',
            redirectTo: ''
          }
        ],
        component: BaseLayoutComponent,
        path: 'ads',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ads',
      },
      {
        path: '**',
        redirectTo: 'ads',
      },
    ],
    component: AppComponent,
    path: '',
  },
] satisfies Routes;
