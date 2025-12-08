import { Component, effect, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdSharingService } from '../../../core/services/ad-sharing.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SEARCH_INPUT_STORE } from '../search-input/search-input.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';

@Component({
  imports: [
    RouterModule,
    CategorySelectorComponent,
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
  selectedCategoryId = '';

  private router = inject(Router);
  private authService = inject(AuthService);
  private adSharingService = inject(AdSharingService);
  private searchStore = inject(SEARCH_INPUT_STORE);

  private searchSubject = new Subject<string>();

  constructor() {
    const debouncedSearch = toSignal(
      this.searchSubject.pipe(debounceTime(500)),
      { initialValue: undefined }
    );

    effect(() => {
      const searchValue = debouncedSearch();
      if (searchValue !== undefined) {
        this.performSearch(searchValue, this.selectedCategoryId);
      }
    });

    effect(() => {
      const searchValue = this.searchStore.value();
      if (searchValue !== undefined) {
        this.searchSubject.next(searchValue);
      }
    });

    effect(() => {
      const searchValue = this.searchStore.value();
      if (searchValue === undefined) {
        this.performFullReset();
      }
    });

    effect(() => {
      const subscription = this.adSharingService.resetFilters$
        .subscribe(() => {
          this.clearSearch();
        });

      return () => subscription.unsubscribe();
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
    this.router.navigate(['/ads']);
  }

  onCategorySelect(categoryId: string): void {
    this.selectedCategoryId = categoryId;

    const currentSearch = this.searchStore.value();
    if (currentSearch !== undefined) {
      this.performSearch(currentSearch, categoryId);
    } else {
      this.performCategorySearch(categoryId);
    }
  }

  performCategorySearch(categoryId: string): void {
    const searchParams = {
      search: '',
      category: categoryId,
      showNonActive: false,
    };

    this.adSharingService.notifySearchParams(searchParams);

    this.router.navigate(['/ads'], {
      queryParams: {
        category: categoryId,
        search: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private performSearch(searchQuery?: string, categoryId?: string): void {
    const searchParams = {
      search: searchQuery?.trim() || '',
      category: categoryId || undefined,
      showNonActive: false,
    };

    this.adSharingService.notifySearchParams(searchParams);

    this.router.navigate(['/ads'], {
      queryParams: {
        search: searchQuery?.trim() || null,
        category: categoryId || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch(): void {
    this.selectedCategoryId = '';
    this.searchStore.reset();
  }

  private performFullReset(): void {
    this.selectedCategoryId = '';

    this.adSharingService.notifySearchParams({
      search: '',
      category: undefined,
      showNonActive: false,
    });

    this.router.navigate(['/ads'], { queryParams: {} });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
