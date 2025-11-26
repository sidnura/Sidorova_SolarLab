import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AddAdvertisementComponent } from './add-advertisement.component';

export default [
  {
    canActivate: [AuthGuard],
    component: AddAdvertisementComponent,
    path: '',
  },
] satisfies Routes;
