import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, ReplaySubject, Subscription, takeUntil } from 'rxjs';
import { AdModel } from '../../core/models/ad.model';
import { AdService } from '../../core/services/ad.service';
import {
  AdSharingService,
  SearchParamsModel,
} from '../../core/services/ad-sharing.service';
import { AuthService } from '../../core/services/auth.service';
import { AdListCommonStateModule } from '../../store/ad-list-common-state/ad-list-common-state.module';
import { AdListFacade } from '../../store/ad-list-common-state/ad-list-state/ad-list.facade';

@Component({
  imports: [
    RouterModule,
    AdListCommonStateModule,
    NgIf,
    DecimalPipe,
    AsyncPipe,
  ],
  selector: 'app-ads',
  standalone: true,
  styleUrl: './ads.component.scss',
  templateUrl: './ads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsComponent implements OnInit, OnDestroy {
  public adList$: Observable<AdModel[]> = this.adListFacade.elements$;

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
  private destroy$: ReplaySubject<void> = new ReplaySubject<void>(1);

  constructor(
    private adService: AdService,
    private adSharingService: AdSharingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private readonly adListFacade: AdListFacade
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    this.setupNewAdListener();
    this.setupSearchListener();
    this.setupRouteListener();

    this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

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

    this.adService
      .getAds()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Ошибка загрузки объявлений';
          this.apiAdvertisements = [];
          this.filteredAdvertisements = [];
        },
        next: (ads: AdModel[]) => {
          this.isLoading = false;
          const sortedAds = this.sortAdsByDate(ads);

          this.apiAdvertisements = sortedAds;
          this.filteredAdvertisements = sortedAds;
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
        next: () => {
          this.apiAdvertisements = this.apiAdvertisements.filter(
            (ad) => ad.id !== adId
          );
          this.filteredAdvertisements = this.filteredAdvertisements.filter(
            (ad) => ad.id !== adId
          );
        },
      });
    }
  }

  getAllAds(): any[] {
    const adsToShow = this.apiAdvertisements;

    const apiAdsFormatted = adsToShow.map((ad) => ({
      cost: ad.cost,
      date: this.formatDate(ad.createdAt),
      hasImage: this.hasImage(ad),
      id: ad.id,
      image: this.getImageUrl(ad),
      location: ad.location,
      name: ad.name,
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

  protected onClick(ad: AdModel): void {
    this.router.navigate(['ad', ad.id], { relativeTo: this.route });
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
          category: categoryParam || undefined,
          search: searchParam || '',
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
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Ошибка поиска объявлений';
          this.apiAdvertisements = [];
          this.filteredAdvertisements = [];
        },
        next: (ads: AdModel[]) => {
          this.isLoading = false;
          const sortedAds = this.sortAdsByDate(ads);

          this.apiAdvertisements = sortedAds;
          this.filteredAdvertisements = sortedAds;
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
