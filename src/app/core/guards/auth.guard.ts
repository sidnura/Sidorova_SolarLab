import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    const userLogin = this.authService.getUserLogin();
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn && token && userLogin) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}