import { Routes } from '@angular/router';
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
              import('./core/auth/login-page/routes').then((m) => m.default),
            path: 'login',
          },
          {
            loadChildren: () =>
              import('./core/auth/register-page/routes').then((m) => m.default),
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
            loadChildren: () => import('./modules/ads-page/routes'),
            path: '',
            pathMatch: 'full',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./modules/ads-page/add-advertisement-page/routes'),
            path: 'add-ad',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./modules/ads-page/edit-advertisement-page/routes'),
            path: 'edit-ad/:id',
          },
          {
            loadChildren: () =>
              import('./modules/ad-modules/ad-details-page/routes'),
            path: 'ad/:id',
          },
          {
            canActivate: [AdminGuard],
            loadChildren: () => import('./modules/users/user-list/routes'),
            path: 'users',
          },
          {
            canActivate: [AuthGuard],
            loadChildren: () => import('./modules/users/user-profile/routes'),
            path: 'profile',
          },
          {
            canActivate: [AdminGuard],
            loadChildren: () => import('./modules/users/user-profile/routes'),
            path: 'users/:id',
          },
          {
            path: '**',
            redirectTo: '',
          },
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
    path: '',
  },
] satisfies Routes;
