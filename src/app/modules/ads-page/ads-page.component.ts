import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, Observable, ReplaySubject, Subscription, takeUntil } from 'rxjs';
import { AdModel } from '@models/ad.model';
import { AdService } from '../../core/services/ad.service';
import {
  AdSharingService,
  SearchParamsModel,
} from '../../core/services/ad-sharing.service';
import { AuthService } from '../../core/services/auth.service';
import { CardLayoutComponent } from '../../shared/components/card-layout/card-layout.component';
import { ImageLazyLoaderComponent } from '../../shared/components/image-lazy-loader/image-lazy-loader.component';
import { AdListCommonStateModule } from '../../store/ad-list-common-state/ad-list-common-state.module';
import { AdListFacade } from '../../store/ad-list-common-state/ad-list-state/ad-list.facade';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    AdListCommonStateModule,
    DecimalPipe,
    AsyncPipe,
    ImageLazyLoaderComponent,
    CardLayoutComponent,
  ],
  selector: 'app-advertisements-list-page',
  standalone: true,
  styleUrl: './ads-page.component.scss',
  templateUrl: './ads-page.component.html',
})
export class AdvertisementsListPageComponent implements OnInit, OnDestroy {
  public adList$: Observable<AdModel[]> = this.adListFacade.elements$;
  public loading$: Observable<Record<string, boolean>> =
    this.adListFacade.loading$;

  public sortedAdList$: Observable<AdModel[]> = this.adList$.pipe(
    map((ads) => this.sortAdsByDate(ads))
  );

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

  hasActiveFilters(): boolean {
    return this.hasActiveCategory || this.hasActiveSearch;
  }

  resetAllFilters(): void {
    this.hasActiveCategory = false;
    this.hasActiveSearch = false;
    this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
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
          this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
        },
      });
    }
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

  protected onClick(ad: AdModel): void {
    this.router.navigate(['/ads/ad', ad.id], { relativeTo: this.route });
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
        this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
        this.adSharingService.clearNewAd();
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
        this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
      }
    });
  }

  private performSearch(searchParams: SearchParamsModel): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (searchParams.search || searchParams.category) {
      this.adListFacade.load({
        search: searchParams.search || undefined,
        category: searchParams.category || undefined,
        showNonActive: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } else {
      this.adListFacade.load({ sortBy: 'createdAt', sortOrder: 'desc' });
    }

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe((loadingState) => {
      this.isLoading = loadingState['list'] || false;
      if (!this.isLoading) {
        this.errorMessage = '';
      }
    });
  }

  private sortAdsByDate(ads: AdModel[]): AdModel[] {
    if (!ads || ads.length === 0) return [];

    return [...ads].sort((a, b) => {
      try {
        const dateAStr = a.createdAt || a.created || '';
        const dateBStr = b.createdAt || b.created || '';

        if (!dateAStr || !dateBStr) return 0;

        const dateA = new Date(dateAStr).getTime();
        const dateB = new Date(dateBStr).getTime();

        return dateB - dateA;
      } catch (error) {
        console.error('Error sorting ads:', error, a, b);
        return 0;
      }
    });
  }
}
