// guards/admin.guard.ts
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
    
    console.log(' === ПРОВЕРКА ADMIN GUARD ===');
    console.log('Пользователь:', this.authService.getUserLogin());
    console.log('Авторизован:', isLoggedIn);
    console.log('Администратор:', isAdmin);

    if (isLoggedIn && isAdmin) {
      console.log('ADMIN GUARD: ДОСТУП РАЗРЕШЕН');
      return true;
    } else {
      console.log('ADMIN GUARD: ДОСТУП ЗАПРЕЩЕН');
      
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