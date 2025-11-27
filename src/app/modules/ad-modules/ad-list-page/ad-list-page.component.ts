import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AdModel } from '../../../core/models/ad.model';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { CommentsComponent } from '../../../shared/components/comments/comments.component';
import { AdDetailCommonStateModule } from './store/ad-detail-common-state/ad-detail-common-state.module';
import { AdDetailFacade } from './store/ad-detail-common-state/ad-detail-state/ad-detail.facade';

@Component({
  selector: 'app-ad-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommentsComponent,
    AdDetailCommonStateModule
  ],
  templateUrl: './ad-list-page.component.html',
  styleUrls: ['./ad-list-page.component.scss']
})
export class AdListPageComponent implements OnInit, OnDestroy {
  public element$: Observable<AdModel | null> = this.adDetailFacade.elements$;
  public loading$: Observable<Record<string, boolean>> = this.adDetailFacade.loading$;

  showPhone = false;
  currentImageUrl: string | null = null;
  hasAdvertisementImage: boolean = false;
  allImageUrls: string[] = [];
  currentImageIndex: number = 0;
  isOwner = false;
  currentUserId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private authService: AuthService,
    private readonly adDetailFacade: AdDetailFacade
  ) {}

  ngOnInit() {
    const adId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = this.authService.getUserId();

    if (adId) {
      this.adDetailFacade.load(adId);
    }

    this.element$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ad => {
        if (ad) {
          this.hasAdvertisementImage = this.hasImage(ad);
          this.allImageUrls = this.getAllImageUrls(ad);
          this.currentImageUrl = this.getCurrentImageUrl();
          this.isOwner = this.checkIfOwner(ad);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkIfOwner(ad: AdModel): boolean {
    if (!this.currentUserId || !ad.user) return false;
    return ad.user.id === this.currentUserId;
  }

  onEdit(): void {
    this.element$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ad => {
        if (ad) {
          this.router.navigate(['/edit-ad', ad.id]);
        }
      });
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
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.allImageUrls.length;
      this.currentImageUrl = this.getCurrentImageUrl();
    }
  }

  prevImage(): void {
    if (this.allImageUrls.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.allImageUrls.length) %
        this.allImageUrls.length;
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

  getPhoneNumber(ad: AdModel): string {
    return ad?.phone || '+7 (999) 123-45-67';
  }

  hasMultipleImages(): boolean {
    return this.allImageUrls.length > 1;
  }
}
