import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { EditAdvertisementPageComponent } from './edit-advertisement.component';

export default [
  {
    canActivate: [AuthGuard],
    component: EditAdvertisementPageComponent,
    path: '',
  },
] satisfies Routes;
