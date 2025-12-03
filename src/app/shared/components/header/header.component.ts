import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdSharingService } from '../../../core/services/ad-sharing.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  imports: [
    RouterModule,
    CategorySelectorComponent,
    ReactiveFormsModule,
    FormsModule,
    SearchInputComponent,
  ],
  selector: 'app-header',
  standalone: true,
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userLogin: string | null = null;
  searchForm: FormGroup;
  selectedCategoryId: string = '';

  search: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private adSharingService: AdSharingService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
      this.userLogin = this.authService.getUserLogin();
    });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userLogin = this.authService.getUserLogin();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onCategorySelect(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.performCategorySearch(categoryId);
  }

  performCategorySearch(categoryId: string): void {
    const searchParams = {
      search: '',
      category: categoryId,
      showNonActive: false,
    };

    this.adSharingService.notifySearchParams(searchParams);

    this.router.navigate(['/ads-page'], {
      queryParams: {
        category: categoryId,
        search: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(): void {
    const searchQuery = this.searchForm.get('searchQuery')?.value?.trim();

    if (searchQuery) {
      this.selectedCategoryId = '';
    }

    if (searchQuery || this.selectedCategoryId) {
      const searchParams = {
        search: searchQuery || '',
        category: this.selectedCategoryId || undefined,
        showNonActive: false,
      };

      this.adSharingService.notifySearchParams(searchParams);

      this.router.navigate(['/ads-page'], {
        queryParams: {
          search: searchQuery || null,
          category: this.selectedCategoryId || null,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({
      searchQuery: '',
    });

    this.selectedCategoryId = '';

    this.adSharingService.notifySearchParams({
      search: '',
      category: undefined,
      showNonActive: false,
    });

    this.router.navigate(['/ads-page'], { queryParams: {} });
  }

  onSearchInputKeypress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  hasSearchText(): boolean {
    return (
      !!this.searchForm.get('searchQuery')?.value?.trim() ||
      !!this.selectedCategoryId
    );
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  protected onSearchChange(event: any): void {
    console.log(event);
  }
}
