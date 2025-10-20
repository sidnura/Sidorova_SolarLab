// app.routes.ts
import { Routes } from '@angular/router';
import { AdsComponent } from './modules/ads/ads.component';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { AddAdvertisementComponent } from './modules/ads/add-advertisement/add-advertisement.component';
import { EditAdvertisementComponent } from './modules/ads/edit-advertisement/edit-advertisement.component';
import { AdDetailComponent } from './modules/ads/ad-detail/ad-detail.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';
import { UserProfileComponent } from './modules/users/user-profile/user-profile.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      { path: '', component: AdsComponent },
      { path: 'ads', component: AdsComponent },
      { path: 'add-ad', component: AddAdvertisementComponent, canActivate: [AuthGuard] },
      { path: 'edit-ad/:id', component: EditAdvertisementComponent, canActivate: [AuthGuard] },
      { path: 'ad/:id', component: AdDetailComponent },
      
      // Управление пользователями - только для админов
      { path: 'users', component: UserListComponent, canActivate: [AdminGuard] },
      { path: 'users/:id', component: UserProfileComponent, canActivate: [AdminGuard] },
      { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] }
    ]
  },
  
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  
  { path: '**', redirectTo: '', pathMatch: 'full' }
];