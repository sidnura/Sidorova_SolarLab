// ads.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdService } from '../services/ad.service';
import { AdSharingService, SearchParams } from '../services/ad-sharing.service';
import { AuthService } from '../services/auth.service';
import { Ad } from '../models/ad.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss'
})
export class AdsComponent implements OnInit, OnDestroy {
  apiAdvertisements: Ad[] = [];
  filteredAdvertisements: Ad[] = [];
  
  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  hasActiveCategory = false;

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
  ) {}

  ngOnInit(): void {
    this.loadAdvertisements();
    this.setupNewAdListener();
    this.setupAuthListener();
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

  private setupAuthListener(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      console.log('🔄 Статус авторизации в AdsComponent:', this.isLoggedIn);
    });
    
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('🔐 Начальный статус авторизации:', this.isLoggedIn);
  }

  private setupNewAdListener(): void {
    this.newAdSubscription = this.adSharingService.newAd$.subscribe(newAd => {
      if (newAd) {
        console.log('🔄 Получено новое объявление:', newAd);
        this.adSharingService.clearNewAd();
        this.loadAdvertisements();
      }
    });
  }

  private setupSearchListener(): void {
    this.searchParamsSubscription = this.adSharingService.searchParams$.subscribe(params => {
      if (params) {
        console.log('🔍 Получены параметры поиска:', params);
        this.hasActiveCategory = !!params.category;
        this.performSearch(params);
        this.adSharingService.clearSearchParams();
      }
    });
  }

  private setupRouteListener(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      const searchParam = params['search'];
      const categoryParam = params['category'];
      
      if (searchParam || categoryParam) {
        const searchParams: SearchParams = {
          search: searchParam || '',
          category: categoryParam || undefined,
          showNonActive: false
        };
        console.log('🔍 Параметры поиска из URL:', searchParams);
        this.hasActiveCategory = !!categoryParam;
        this.performSearch(searchParams);
      } else {
        this.hasActiveCategory = false;
      }
    });
  }

  private performSearch(searchParams: SearchParams): void {
    this.isLoading = true;
    console.log('🔍 Выполнение поиска с параметрами:', searchParams);
    
    this.adService.searchAds(searchParams).subscribe({
      next: (ads: Ad[]) => {
        this.isLoading = false;
        
        const sortedAds = this.sortAdsByDate(ads);
        
        this.apiAdvertisements = sortedAds;
        this.filteredAdvertisements = sortedAds;
        console.log('✅ Результаты поиска загружены и отсортированы:', sortedAds);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Ошибка поиска объявлений:', error);
        this.errorMessage = 'Ошибка поиска объявлений';
        this.apiAdvertisements = [];
        this.filteredAdvertisements = [];
      }
    });
  }

  loadAdvertisements(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔄 Загрузка объявлений с API...');
    
    this.adService.getAds().subscribe({
      next: (ads: Ad[]) => {
        this.isLoading = false;
        
        const sortedAds = this.sortAdsByDate(ads);
        
        this.apiAdvertisements = sortedAds;
        this.filteredAdvertisements = sortedAds;
        console.log('✅ API объявления загружены и отсортированы:', sortedAds);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Ошибка загрузки API объявлений:', error);
        this.errorMessage = 'Ошибка загрузки объявлений';
        this.apiAdvertisements = [];
        this.filteredAdvertisements = [];
      }
    });
  }

  hasActiveCategoryFilter(): boolean {
    return this.hasActiveCategory;
  }

  resetCategoryFilters(): void {
    console.log('🔄 Сброс фильтров категории');
    this.hasActiveCategory = false;
    this.loadAdvertisements();
    this.router.navigate(['/ads'], { queryParams: {} });
  }

  private sortAdsByDate(ads: Ad[]): Ad[] {
    return ads.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  deleteAd(adId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
      console.log('🗑️ Попытка удаления объявления ID:', adId);
      
      this.adService.deleteAd(adId).subscribe({
        next: () => {
          console.log('✅ Объявление удалено');
          this.apiAdvertisements = this.apiAdvertisements.filter(ad => ad.id !== adId);
          this.filteredAdvertisements = this.filteredAdvertisements.filter(ad => ad.id !== adId);
        },
        error: (error: any) => {
          console.error('❌ Ошибка удаления объявления:', error);
          this.errorMessage = 'Ошибка при удалении объявления';
          
          if (error.status === 404) {
            this.errorMessage = 'Объявление не найдено';
          } else if (error.status === 403) {
            this.errorMessage = 'Нет прав для удаления этого объявления';
          } else if (error.status === 401) {
            this.errorMessage = 'Необходимо авторизоваться';
          }
        }
      });
    }
  }

  getAllAds(): any[] {
    const adsToShow = this.filteredAdvertisements.length > 0 ? this.filteredAdvertisements : this.apiAdvertisements;
    
    const apiAdsFormatted = adsToShow.map(ad => ({
      id: ad.id,
      name: ad.name,
      cost: ad.cost,
      location: ad.location,
      image: this.getImageUrl(ad),
      date: this.formatDate(ad.createdAt),
      hasImage: this.hasImage(ad)
    }));

    return apiAdsFormatted;
  }

  private hasImage(ad: Ad): boolean {
    return !!(ad.imagesIds && ad.imagesIds.length > 0);
  }

  getImageUrl(ad: Ad): string | null {
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
    console.log('🖼️ Изображение недоступно для объявления:', ad?.name);
    
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
}