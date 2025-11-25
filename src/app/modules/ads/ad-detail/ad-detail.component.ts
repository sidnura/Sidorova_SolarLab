import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentsComponent } from '../../../shared/components/comments/comments.component';
import { AdModel } from '../../../core/models/ad.model';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule, CommentsComponent],
  templateUrl: './ad-detail.component.html',
  styleUrl: './ad-detail.component.scss'
})
export class AdDetailComponent implements OnInit {
  advertisement: AdModel | null = null;
  showPhone = false;
  isLoading = true;
  errorMessage = '';
  currentImageUrl: string | null = null;
  hasAdvertisementImage: boolean = false;
  allImageUrls: string[] = [];
  currentImageIndex: number = 0;
  isOwner = false;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const adId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.authService.getUserId();

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
      next: (ad: AdModel) => {
        this.isLoading = false;
        this.advertisement = ad;
        this.hasAdvertisementImage = this.hasImage(ad);
        this.allImageUrls = this.getAllImageUrls(ad);
        this.currentImageUrl = this.getCurrentImageUrl();

        this.isOwner = this.checkIfOwner(ad);
      },
      error: (error: any) => {
        this.isLoading = false;

        if (error.status === 404) {
          this.errorMessage = 'Объявление не найдено';
        } else if (error.status === 500) {
          this.errorMessage = 'Ошибка сервера. Попробуйте позже.';
        } else {
          this.errorMessage = 'Ошибка загрузки объявления';
        }

        this.advertisement = null;
      }
    });
  }

  checkIfOwner(ad: AdModel): boolean {
    if (!this.currentUserId || !ad.user) return false;
    return ad.user.id === this.currentUserId;
  }

  onEdit(): void {
    if (this.advertisement) {
      this.router.navigate(['/edit-ad', this.advertisement.id]);
    }
  }

  togglePhone() {
    this.showPhone = !this.showPhone;
  }

  hasImage(ad: AdModel): boolean {
    return !!(ad.imagesIds && ad.imagesIds.length > 0);
  }

  getAllImageUrls(ad: AdModel): string[] {
    return this.adService.getAllImageUrls(ad);
  }

  getCurrentImageUrl(): string | null {
    if (this.allImageUrls.length > 0) {
      return this.allImageUrls[this.currentImageIndex];
    }
    return null;
  }

  nextImage(): void {
    if (this.allImageUrls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.allImageUrls.length;
      this.currentImageUrl = this.getCurrentImageUrl();
    }
  }

  prevImage(): void {
    if (this.allImageUrls.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.allImageUrls.length) % this.allImageUrls.length;
      this.currentImageUrl = this.getCurrentImageUrl();
    }
  }

  onImageError(event: any): void {
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

  hasMultipleImages(): boolean {
    return this.allImageUrls.length > 1;
  }
}
