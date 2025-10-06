import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdService } from '../services/ad.service';
import { AdSharingService } from '../services/ad-sharing.service';
import { StorageService } from '../services/storage.service';
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
  localCreatedAds: Ad[] = [];
  
  isLoading = true;
  errorMessage = '';

  private newAdSubscription!: Subscription;

  // Статические объявления
  staticAdvertisements = [
    { 
      id: '1', 
      name: 'Ноутбук MacBook Air M1', 
      cost: 85000, 
      image: 'assets/images/laptop1.png', 
      location: 'Москва, Ленинский проспект', 
      date: 'Сегодня 18:59',
      createdAt: new Date().toISOString(),
      isActive: true,
      imagesIds: []
    },
    { 
      id: '2', 
      name: 'Умные часы Xiaomi', 
      cost: 4000, 
      image: 'assets/images/watch1.png', 
      location: 'Москва, Ленинский проспект', 
      date: 'Сегодня 18:59',
      createdAt: new Date().toISOString(),
      isActive: true,
      imagesIds: []
    }
  ];

  constructor(
    private adService: AdService,
    private adSharingService: AdSharingService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadAdvertisements();
    this.loadLocalCreatedAds();
    this.setupNewAdListener();
  }

  ngOnDestroy(): void {
    if (this.newAdSubscription) {
      this.newAdSubscription.unsubscribe();
    }
  }

  private setupNewAdListener(): void {
    this.newAdSubscription = this.adSharingService.newAd$.subscribe(newAd => {
      if (newAd) {
        console.log('🔄 Получено новое объявление:', newAd);
        this.addNewAd(newAd);
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

  private loadLocalCreatedAds(): void {
    this.localCreatedAds = this.storageService.getLocalAds();
    console.log('📁 Загружены локальные объявления:', this.localCreatedAds);
  }

  private saveLocalCreatedAds(): void {
    this.storageService.saveLocalAds(this.localCreatedAds);
  }

  addNewAd(ad: Ad): void {
    console.log('➕ Добавление нового объявления:', ad);
    
    const existingAd = this.localCreatedAds.find(item => item.id === ad.id);
    if (!existingAd) {
      this.localCreatedAds.unshift(ad);
      this.saveLocalCreatedAds();
      console.log('✅ Новое объявление добавлено');
    }
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

    const localAdsFormatted = this.localCreatedAds.map(ad => ({
      id: ad.id,
      name: ad.name,
      cost: ad.cost,
      location: ad.location,
      image: this.getImageUrl(ad),
      date: this.formatDate(ad.createdAt),
      hasImage: this.hasImage(ad)
    }));

    const staticAdsFormatted = this.staticAdvertisements.map(ad => ({
      ...ad,
      hasImage: true
    }));

    return [...localAdsFormatted, ...apiAdsFormatted, ...staticAdsFormatted];
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

  refreshAds(): void {
    this.loadAdvertisements();
    this.loadLocalCreatedAds();
  }
}