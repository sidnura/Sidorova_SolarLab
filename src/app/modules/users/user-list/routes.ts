import { Routes } from '@angular/router';
import { AdminGuard } from '../../../core/guards/admin.guard';
import { UserListComponent } from './user-list.component';

export default [
  {
    canActivate: [AdminGuard],
    component: UserListComponent,
    path: '',
  },
] satisfies Routes;
