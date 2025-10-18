// app.routes.ts
import { Routes } from '@angular/router';
import { AdsComponent } from './ads/ads.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddAdvertisementComponent } from './ads/add-advertisement/add-advertisement.component';
import { EditAdvertisementComponent } from './ads/edit-advertisement/edit-advertisement.component';
import { AdDetailComponent } from './ads/ad-detail/ad-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';

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