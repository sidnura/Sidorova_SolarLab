import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdService } from '../services/ad.service';
import { AdSharingService } from '../services/ad-sharing.service';
import { AuthService } from '../services/auth.service'; // Добавляем AuthService
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
  
  isLoading = true;
  errorMessage = '';
  isLoggedIn = false; // Добавляем статус авторизации

  private newAdSubscription!: Subscription;
  private authSubscription!: Subscription;

  constructor(
    private adService: AdService,
    private adSharingService: AdSharingService,
    private authService: AuthService // Добавляем AuthService
  ) {}

  ngOnInit(): void {
    this.loadAdvertisements();
    this.setupNewAdListener();
    this.setupAuthListener(); // Добавляем слушатель авторизации
  }

  ngOnDestroy(): void {
    if (this.newAdSubscription) {
      this.newAdSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private setupAuthListener(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      console.log('🔄 Статус авторизации в AdsComponent:', this.isLoggedIn);
    });
    
    // Инициализируем начальное значение
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('🔐 Начальный статус авторизации:', this.isLoggedIn);
  }

  private setupNewAdListener(): void {
    this.newAdSubscription = this.adSharingService.newAd$.subscribe(newAd => {
      if (newAd) {
        console.log('🔄 Получено новое объявление:', newAd);
        this.adSharingService.clearNewAd();
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
        this.apiAdvertisements = ads;
        console.log('✅ API объявления загружены:', ads);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Ошибка загрузки API объявлений:', error);
        this.errorMessage = 'Ошибка загрузки объявлений';
        this.apiAdvertisements = [];
      }
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
          this.loadAdvertisements();
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
    const apiAdsFormatted = this.apiAdvertisements.map(ad => ({
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
    if (this.hasImage(ad)) {
      return null;
    }
    return null;
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
        <div style="width: 100%; height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 14px; border-radius: 8px;">
          📷 Нет фото
        </div>
      `;
      parent.appendChild(placeholder);
    }
  }
}