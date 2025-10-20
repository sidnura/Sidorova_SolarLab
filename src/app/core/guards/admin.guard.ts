import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isAdmin = this.authService.isAdmin();

    if (isLoggedIn && isAdmin) {
      return true;
    } else {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      } else {
        this.router.navigate(['/']);
        alert('Недостаточно прав для доступа к странице пользователей');
      }
      return false;
    }
  }
}