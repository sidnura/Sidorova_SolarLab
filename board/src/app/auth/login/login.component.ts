import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formData = this.loginForm.value;
      const loginData: LoginRequest = {
        login: formData.login,
        password: formData.password
      };

      console.log('🔄 Отправка данных для входа:', loginData);

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Вход выполнен:', response);
          // Перенаправляем на главную страницу
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Ошибка входа:', error);
          
          // Упрощенная обработка ошибок
          if (error.status === 400) {
            this.errorMessage = '❌ Неверный логин или пароль';
          } else if (error.status === 0) {
            this.errorMessage = '❌ Нет соединения с сервером';
          } else {
            this.errorMessage = '❌ Ошибка при входе. Попробуйте позже.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = '❌ Пожалуйста, заполните все поля правильно';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get login() {
    return this.loginForm.get('login');
  }

  get password() {
    return this.loginForm.get('password');
  }
}