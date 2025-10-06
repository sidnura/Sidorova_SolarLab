import { Routes } from '@angular/router';
import { AdsComponent } from './ads/ads.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddAdvertisementComponent } from './ads/add-advertisement/add-advertisement.component';
import { AdDetailComponent } from './ads/ad-detail/ad-detail.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: AdsComponent },
  { path: 'ads', component: AdsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'add-ad', component: AddAdvertisementComponent, canActivate: [AuthGuard] },
  { path: 'ad/:id', component: AdDetailComponent }
];