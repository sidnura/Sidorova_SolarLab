import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';

export const routes: Routes = [
  {
    children: [
      {
        loadChildren: () => import('./core/auth/login/routes').then(m => m.default),
        path: 'login',
      },
      {
        loadChildren: () => import('./core/auth/register/routes').then(m => m.default),
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
        loadChildren: () => import('./modules/ads/routes').then(m => m.default), // Изменено
        path: '',
      },
      {
        loadChildren: () => import('./modules/ads/routes').then(m => m.default), // Изменено
        path: 'ads',
      },
      {
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/ads/add-advertisement/routes').then(m => m.default),
        path: 'add-ad',
      },
      {
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/ads/edit-advertisement/routes').then(m => m.default),
        path: 'edit-ad/:id',
      },
      {
        loadChildren: () => import('./modules/ads/ad-detail/routes').then(m => m.default),
        path: 'ad/:id',
      },
      {
        canActivate: [AdminGuard],
        loadChildren: () => import('./modules/users/user-list/routes').then(m => m.default),
        path: 'users',
      },
      {
        canActivate: [AdminGuard],
        loadChildren: () => import('./modules/users/user-profile/routes').then(m => m.default),
        path: 'users/:id',
      },
      {
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/users/user-profile/routes').then(m => m.default),
        path: 'profile',
      },
    ],
    component: BaseLayoutComponent,
    path: '',
  },

  {
    path: 'login',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'register',
    pathMatch: 'full',
    redirectTo: 'auth/register',
  },

  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
