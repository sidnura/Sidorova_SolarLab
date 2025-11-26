import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequestModel } from '../../services/auth.service';
import { markFormGroupTouched } from '../../utils/form.utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;
      const registerData: RegisterRequestModel = {
        login: formData.login,
        email: formData.email,
        password: formData.password,
        name: formData.name
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Регистрация успешна! Автоматический вход выполнен. Перенаправляем на главную страницу...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 400) {
            if (error.error?.errors) {
              const validationErrors = error.error.errors;
              if (validationErrors.Password) {
                this.errorMessage = `Пароль: ${validationErrors.Password.join(', ')}`;
              } else if (validationErrors.Login) {
                this.errorMessage = `Логин: ${validationErrors.Login.join(', ')}`;
              } else if (validationErrors.Email) {
                this.errorMessage = `Email: ${validationErrors.Email.join(', ')}`;
              } else if (validationErrors.Name) {
                this.errorMessage = `Имя: ${validationErrors.Name.join(', ')}`;
              } else {
                this.errorMessage = 'Неверные данные. Проверьте заполнение полей.';
              }
            } else if (error.error?.userMessage) {
              this.errorMessage = error.error.userMessage;
            } else {
              this.errorMessage = 'Неверные данные. Проверьте заполнение полей.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'Пользователь с таким логином уже существует.';
          } else if (error.status === 500) {
            this.errorMessage = 'Ошибка сервера. Попробуйте позже.';
          } else if (error.status === 0) {
            this.errorMessage = 'Нет соединения с сервером. Проверьте интернет-соединение.';
          } else {
            this.errorMessage = error.error?.userMessage || 'Неизвестная ошибка при регистрации.';
          }
        }
      });
    } else {
      markFormGroupTouched(this.registerForm);
      this.errorMessage = 'Пожалуйста, заполните все поля правильно';
    }
  }

  get name() {
    return this.registerForm.get('name');
  }

  get login() {
    return this.registerForm.get('login');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
