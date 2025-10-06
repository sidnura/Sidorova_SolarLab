import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdService } from '../../services/ad.service';
import { Ad } from '../../models/ad.model';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-detail.component.html',
  styleUrl: './ad-detail.component.scss'
})
export class AdDetailComponent implements OnInit {
  advertisement: Ad | null = null;
  showPhone = false;
  isLoading = true;
  errorMessage = '';
  currentImageUrl: string | null = null;
  hasAdvertisementImage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private adService: AdService
  ) {}

  ngOnInit() {
    const adId = this.route.snapshot.paramMap.get('id');
    console.log('🔄 Loading ad with ID:', adId);
    
    if (adId) {
      this.loadAdvertisement(adId);
    } else {
      this.errorMessage = 'ID объявления не указан';
      this.isLoading = false;
    }
  }

  getAdId(): string {
    return this.route.snapshot.paramMap.get('id') || '';
  }

  loadAdvertisement(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.adService.getAdById(id).subscribe({
      next: (ad: Ad) => {
        this.isLoading = false;
        this.advertisement = ad;
        this.hasAdvertisementImage = this.hasImage(ad);
        this.currentImageUrl = this.getImageUrl(ad);
        console.log('📦 Found advertisement:', ad);
        console.log('🖼️ Image info - hasImage:', this.hasAdvertisementImage, 'imageUrl:', this.currentImageUrl);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Error loading advertisement:', error);
        this.errorMessage = 'Ошибка загрузки объявления';
        
        // Временные данные для демонстрации
        this.advertisement = this.getMockAd(id);
        if (this.advertisement) {
          this.hasAdvertisementImage = this.hasImage(this.advertisement);
          this.currentImageUrl = this.getImageUrl(this.advertisement);
        }
      }
    });
  }

  // Временные моковые данные на случай ошибки
  private getMockAd(id: string): any {
    const mockAds: {[key: string]: any} = {
      '1': { 
        id: '1', 
        name: 'Ноутбук MacBook Air M1', 
        cost: 85000, 
        location: 'Москва, Ленинский проспект', 
        createdAt: new Date().toISOString(),
        isActive: true,
        imagesIds: ['1'],
        description: 'Отличное состояние, используется 1 год. Полная комплектация: оригинальная коробка, зарядное устройство, документы. Батарея держит 8-10 часов. Никаких дефектов, царапин или вмятин. Продаю в связи с переходом на новую модель.',
        phone: '+7 (999) 123-45-67',
        email: 'seller@example.com'
      },
      '2': { 
        id: '2', 
        name: 'Умные часы Xiaomi', 
        cost: 4000, 
        location: 'Москва, Ленинский проспект', 
        createdAt: new Date().toISOString(),
        isActive: true,
        imagesIds: [],
        description: 'Новые умные часы с полной комплектацией. Не использовались, в оригинальной упаковке. Все функции работают отлично.',
        phone: '+7 (999) 987-65-43'
      }
    };
    
    return mockAds[id] || null;
  }

  togglePhone() {
    this.showPhone = !this.showPhone;
  }

  hasImage(ad: Ad): boolean {
    return !!(ad.imagesIds && ad.imagesIds.length > 0);
  }

  getImageUrl(ad: Ad): string | null {
    if (this.hasImage(ad)) {
      // Здесь должен быть реальный URL для получения изображения
      // Например: return `${environment.baseApiURL}/images/${ad.imagesIds[0]}`;
      // Временно возвращаем null для демонстрации
      return null;
    }
    return null;
  }

  onImageError(event: any): void {
    console.log('🖼️ Изображение недоступно для объявления:', this.advertisement?.name);
    
    event.target.style.display = 'none';
    
    const parent = event.target.parentElement;
    if (parent && !parent.querySelector('.no-image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image-placeholder';
      placeholder.innerHTML = `
        <div class="placeholder-content">
          <span class="placeholder-icon">📷</span>
          <span class="placeholder-text">Фото не загружено</span>
        </div>
      `;
      parent.appendChild(placeholder);
    }
  }

  getPhoneNumber(): string {
    return this.advertisement?.phone || '+7 (999) 123-45-67';
  }
}