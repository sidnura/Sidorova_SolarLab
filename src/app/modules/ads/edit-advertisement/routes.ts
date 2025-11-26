import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { EditAdvertisementComponent } from './edit-advertisement.component';

export default [
  {
    canActivate: [AuthGuard],
    component: EditAdvertisementComponent,
    path: '',
  },
] satisfies Routes;
