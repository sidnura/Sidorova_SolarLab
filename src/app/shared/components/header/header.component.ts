import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CategorySelectorComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userLogin: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    // Подписываемся на изменения статуса авторизации
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.userLogin = this.authService.getUserLogin();
      console.log('🔐 Статус авторизации обновлен:', {
        isLoggedIn: this.isLoggedIn,
        userLogin: this.userLogin
      });
    });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userLogin = this.authService.getUserLogin();
    console.log('🔐 Статус авторизации в header:', {
      isLoggedIn: this.isLoggedIn,
      userLogin: this.userLogin
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onCategorySelect(categoryId: string): void {
    console.log('Выбрана категория:', categoryId);
  }
}