import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let clonedReq = req;

  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('🔐 Добавлен Authorization header к запросу');
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('❌ 401 ошибка - неавторизованный доступ');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};