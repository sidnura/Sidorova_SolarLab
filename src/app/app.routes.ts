// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { AdDetailComponent } from './modules/ads/ad-detail/ad-detail.component';
import { AddAdvertisementComponent } from './modules/ads/add-advertisement/add-advertisement.component';
import { AdsComponent } from './modules/ads/ads.component';
import { EditAdvertisementComponent } from './modules/ads/edit-advertisement/edit-advertisement.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';
import { UserProfileComponent } from './modules/users/user-profile/user-profile.component';

export const routes: Routes = [
  {
    children: [
      { component: LoginComponent, path: 'login' },
      { component: RegisterComponent, path: 'register' },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
    component: AuthLayoutComponent,
    path: 'auth',
  },

  {
    children: [
      { component: AdsComponent, path: '' },
      { component: AdsComponent, path: 'ads' },
      {
        canActivate: [AuthGuard],
        component: AddAdvertisementComponent,
        path: 'add-ad',
      },
      {
        canActivate: [AuthGuard],
        component: EditAdvertisementComponent,
        path: 'edit-ad/:id',
      },
      { component: AdDetailComponent, path: 'ad/:id' },

      // Управление пользователями - только для админов
      {
        canActivate: [AdminGuard],
        component: UserListComponent,
        path: 'users',
      },
      {
        canActivate: [AdminGuard],
        component: UserProfileComponent,
        path: 'users/:id',
      },
      {
        canActivate: [AuthGuard],
        component: UserProfileComponent,
        path: 'profile',
      },
    ],
    component: BaseLayoutComponent,
    path: '',
  },

  { path: 'login', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'register', pathMatch: 'full', redirectTo: 'auth/register' },

  { path: '**', pathMatch: 'full', redirectTo: '' },
];
