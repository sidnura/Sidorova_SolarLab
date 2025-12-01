import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AddAdvertisementPageComponent } from './add-advertisement.component';

export default [
  {
    canActivate: [AuthGuard],
    component: AddAdvertisementPageComponent,
    path: '',
  },
] satisfies Routes;
