import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import {
  AdSharingService,
  SearchParamsModel,
} from '../../core/services/ad-sharing.service';
import { AuthService } from '../../core/services/auth.service';
import { AdModel } from '../../core/models/ad.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss',
})
export class AdsComponent implements OnInit, OnDestroy {
  apiAdvertisements: AdModel[] = [];
  filteredAdvertisements: AdModel[] = [];

  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  hasActiveCategory = false;
  hasActiveSearch = false;

  private newAdSubscription!: Subscription;
  private authSubscription!: Subscription;
  private searchParamsSubscription!: Subscription;
  private routeSubscription!: Subscription;

  constructor(
    private adService: AdService,
    private adSharingService: AdSharingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.setupAuthListener();
    this.setupNewAdListener();
    this.setupSearchListener();
    this.setupRouteListener();
  }

  ngOnDestroy(): void {
    if (this.newAdSubscription) {
      this.newAdSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.searchParamsSubscription) {
      this.searchParamsSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadAdvertisements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adService.getAds().subscribe({
      next: (ads: AdModel[]) => {
        this.isLoading = false;
        const sortedAds = this.sortAdsByDate(ads);
        this.apiAdvertisements = sortedAds;
        this.filteredAdvertisements = sortedAds;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Ошибка загрузки объявлений';
        this.apiAdvertisements = [];
        this.filteredAdvertisements = [];
      },
    });
  }

  hasActiveFilters(): boolean {
    return this.hasActiveCategory || this.hasActiveSearch;
  }

  resetAllFilters(): void {
    this.hasActiveCategory = false;
    this.hasActiveSearch = false;
    this.loadAdvertisements();
    this.router.navigate(['/ads'], { queryParams: {} });
  }

  deleteAd(adId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
      this.adService.deleteAd(adId).subscribe({
        next: () => {
          this.apiAdvertisements = this.apiAdvertisements.filter(
            (ad) => ad.id !== adId
          );
          this.filteredAdvertisements = this.filteredAdvertisements.filter(
            (ad) => ad.id !== adId
          );
        },
        error: (error: any) => {
          if (error.status === 404) {
            this.errorMessage = 'Объявление не найдено';
          } else if (error.status === 403) {
            this.errorMessage = 'Нет прав для удаления этого объявления';
          } else if (error.status === 401) {
            this.errorMessage = 'Необходимо авторизоваться';
          } else {
            this.errorMessage = 'Ошибка при удалении объявления';
          }
        },
      });
    }
  }

  getAllAds(): any[] {
    const adsToShow = this.apiAdvertisements;

    const apiAdsFormatted = adsToShow.map((ad) => ({
      id: ad.id,
      name: ad.name,
      cost: ad.cost,
      location: ad.location,
      image: this.getImageUrl(ad),
      date: this.formatDate(ad.createdAt),
      hasImage: this.hasImage(ad),
    }));

    return apiAdsFormatted;
  }

  getImageUrl(ad: AdModel): string | null {
    return this.adService.getFirstImageUrl(ad);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 24) {
        return `Сегодня ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('ru-RU');
      }
    } catch {
      return 'Недавно';
    }
  }

  onImageError(event: any, ad: any): void {
    event.target.style.display = 'none';

    const parent = event.target.parentElement;
    if (parent && !parent.querySelector('.no-image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image-placeholder';
      placeholder.innerHTML = `
        <div class="placeholder-content">
          <span class="placeholder-icon">📷</span>
          <span class="placeholder-text">Нет фото</span>
        </div>
      `;
      parent.appendChild(placeholder);
    }
  }

  private setupAuthListener(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      }
    );

    this.isLoggedIn = this.authService.isLoggedIn();
  }

  private setupNewAdListener(): void {
    this.newAdSubscription = this.adSharingService.newAd$.subscribe((newAd) => {
      if (newAd) {
        this.adSharingService.clearNewAd();
        this.loadAdvertisements();
      }
    });
  }

  private setupSearchListener(): void {
    this.searchParamsSubscription =
      this.adSharingService.searchParams$.subscribe((params) => {
        if (params) {
          this.hasActiveCategory = !!params.category;
          this.hasActiveSearch = !!params.search;
          this.performSearch(params);
          this.adSharingService.clearSearchParams();
        }
      });
  }

  private setupRouteListener(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const searchParam = params['search'];
      const categoryParam = params['category'];

      if (searchParam || categoryParam) {
        const searchParams: SearchParamsModel = {
          search: searchParam || '',
          category: categoryParam || undefined,
          showNonActive: false,
        };

        this.hasActiveCategory = !!categoryParam;
        this.hasActiveSearch = !!searchParam;
        this.performSearch(searchParams);
      } else {
        this.hasActiveCategory = false;
        this.hasActiveSearch = false;
        this.loadAdvertisements();
      }
    });
  }

  private performSearch(searchParams: SearchParamsModel): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (searchParams.search || searchParams.category) {
      this.adService.searchAds(searchParams).subscribe({
        next: (ads: AdModel[]) => {
          this.isLoading = false;
          const sortedAds = this.sortAdsByDate(ads);

          this.apiAdvertisements = sortedAds;
          this.filteredAdvertisements = sortedAds;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Ошибка поиска объявлений';
          this.apiAdvertisements = [];
          this.filteredAdvertisements = [];
        },
      });
    } else {
      this.loadAdvertisements();
    }
  }

  private sortAdsByDate(ads: AdModel[]): AdModel[] {
    return ads.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return dateB - dateA;
    });
  }

  private hasImage(ad: AdModel): boolean {
    return !!(ad.imagesIds && ad.imagesIds.length > 0);
  }
}
