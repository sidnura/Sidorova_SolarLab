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

    console.log('🛡️ === ПРОВЕРКА AUTH GUARD ===');
    console.log('🔐 Токен существует:', !!token);
    console.log('👤 UserId существует:', !!userId);
    console.log('👤 UserLogin существует:', !!userLogin);
    console.log('✅ Пользователь авторизован:', isLoggedIn);

    // ВРЕМЕННО: разрешаем доступ если есть токен и логин, даже без userId
    if (isLoggedIn && token && userLogin) {
      console.log('✅ AUTH GUARD: ДОСТУП К /add-ad РАЗРЕШЕН (временно без userId)');
      return true;
    } else {
      console.log('🚫 AUTH GUARD: ДОСТУП К /add-ad ЗАПРЕЩЕН');
      console.log('🔍 Причина:');
      if (!token) console.log('   - Нет токена');
      if (!userId) console.log('   - Нет userId'); 
      if (!userLogin) console.log('   - Нет userLogin');
      if (!isLoggedIn) console.log('   - Пользователь не авторизован');
      
      this.router.navigate(['/login']);
      return false;
    }
  }
}