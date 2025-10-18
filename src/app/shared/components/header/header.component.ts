import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { AuthService } from '../../../services/auth.service';
import { AdSharingService } from '../../../services/ad-sharing.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CategorySelectorComponent, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userLogin: string | null = null;
  searchForm: FormGroup;
  selectedCategoryId: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private adSharingService: AdSharingService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
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
    console.log('Выбрана категория для поиска:', categoryId);
    this.selectedCategoryId = categoryId;
    
    // Автоматически выполняем поиск при выборе категории
    this.performCategorySearch(categoryId);
  }

  performCategorySearch(categoryId: string): void {
    const searchParams = {
      search: '',
      category: categoryId,
      showNonActive: false
    };

    console.log('📂 Поиск по категории:', searchParams);
    
    // Передаем параметры поиска через сервис
    this.adSharingService.notifySearchParams(searchParams);
    
    // Навигация на страницу объявлений с параметрами категории
    this.router.navigate(['/ads'], { 
      queryParams: { 
        category: categoryId 
      } 
    });
  }

  onSearch(): void {
    const searchQuery = this.searchForm.get('searchQuery')?.value?.trim();
    
    if (searchQuery || this.selectedCategoryId) {
      const searchParams = {
        search: searchQuery || '',
        category: this.selectedCategoryId || undefined,
        showNonActive: false
      };

      console.log('🔍 Параметры поиска:', searchParams);
      
      // Передаем параметры поиска через сервис
      this.adSharingService.notifySearchParams(searchParams);
      
      // Навигация на страницу объявлений с параметрами
      this.router.navigate(['/ads'], { 
        queryParams: { 
          search: searchQuery,
          category: this.selectedCategoryId 
        } 
      });

      console.log('✅ Поиск выполнен, текст сохранен в поле');
    }
  }

  // Метод для сброса поиска
  clearSearch(): void {
    this.searchForm.patchValue({
      searchQuery: ''
    });
    
    // Если есть выбранная категория, выполняем поиск только по категории
    if (this.selectedCategoryId) {
      this.performCategorySearch(this.selectedCategoryId);
    } else {
      // Если нет категории, сбрасываем все фильтры
      this.adSharingService.notifySearchParams({
        search: '',
        category: undefined,
        showNonActive: false
      });
      this.router.navigate(['/ads']);
    }
    
    console.log('🔄 Поиск сброшен');
  }

  onSearchInputKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  // Проверка, есть ли текст в поле поиска для отображения крестика
  hasSearchText(): boolean {
    return !!this.searchForm.get('searchQuery')?.value?.trim();
  }
}