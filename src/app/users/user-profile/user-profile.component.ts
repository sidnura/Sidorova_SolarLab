// src/app/users/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isCurrentUser = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isEditing = false;
  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.loadUser(userId);
    } else {
      this.loadCurrentUser();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  // Валидатор для проверки совпадения паролей
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  loadUser(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.user = user;
        this.checkIfCurrentUser(userId);
        this.populateForm(user);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'загрузки профиля пользователя');
      }
    });
  }

  loadCurrentUser(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.isLoading = false;
        this.user = user;
        this.isCurrentUser = true;
        this.populateForm(user);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'загрузки профиля');
      }
    });
  }

  checkIfCurrentUser(userId: string): void {
    const currentUserId = this.authService.getUserId();
    this.isCurrentUser = currentUserId === userId;
  }

  populateForm(user: User): void {
    this.userForm.patchValue({
      name: user.name,
      login: user.login,
      password: '',
      confirmPassword: ''
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.user) {
      this.populateForm(this.user);
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.userForm.value;
      
      const updateData: any = {
        Name: formData.name,
        Login: formData.login
      };

      // Добавляем пароль только если он был изменен
      if (formData.password && formData.password.trim() !== '') {
        updateData.Password = formData.password;
      } else {
        // Если пароль не меняется, отправляем текущий пароль (нужно получить его от пользователя)
  
        console.log('Пароль не изменен, отправляем данные без пароля');
      }

      console.log('Отправка данных обновления:', updateData);

      this.userService.updateUser(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          this.isLoading = false;
          this.user = { ...this.user, ...updatedUser };
          this.isEditing = false;
          this.successMessage = 'Профиль успешно обновлен!';
          console.log('Профиль обновлен:', updatedUser);
          
          if (this.isCurrentUser) {
            this.authService.refreshAuthStatus();
          }
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleError(error, 'обновления профиля');
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Заполните все обязательные поля правильно';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleError(error: any, action: string): void {
    console.error(` Ошибка ${action}:`, error);
    console.error(' Детали ошибки:', error.error);
    
    if (error.status === 400) {
      if (error.error?.errors) {
        // Обработка ошибок валидации
        const validationErrors = error.error.errors;
        if (validationErrors.Password) {
          this.errorMessage = `Пароль: ${validationErrors.Password.join(', ')}`;
        } else if (validationErrors.Login) {
          this.errorMessage = `Логин: ${validationErrors.Login.join(', ')}`;
        } else if (validationErrors.Name) {
          this.errorMessage = `Имя: ${validationErrors.Name.join(', ')}`;
        } else {
          this.errorMessage = 'Неверные данные. Проверьте заполнение полей.';
        }
      } else if (error.error?.userMessage) {
        this.errorMessage = error.error.userMessage;
      } else {
        this.errorMessage = 'Неверные данные для обновления профиля.';
      }
    } else if (error.status === 403) {
      this.errorMessage = 'Доступ запрещен. Недостаточно прав.';
    } else if (error.status === 404) {
      this.errorMessage = 'Пользователь не найден.';
      setTimeout(() => this.router.navigate(['/users']), 2000);
    } else if (error.status === 422) {
      this.errorMessage = error.error?.userMessage || 'Произошёл конфликт бизнес-логики';
    } else {
      this.errorMessage = `Ошибка ${action}. Попробуйте позже.`;
    }
  }

  get name() { return this.userForm.get('name'); }
  get login() { return this.userForm.get('login'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
}