import { AsyncPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AdModel } from '@models/ad.model';
import { NgLetDirective } from '../../../core/directives/ng-let.directive';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentsComponent } from '../../../shared/components/comments/comments.component';
import { AdDetailsFacade } from '../../../store/ad-list-common-state/ad-details-state/ad-details.facade';
import { AdListCommonStateModule } from '../../../store/ad-list-common-state/ad-list-common-state.module';

@Component({
  imports: [
    RouterModule,
    CommentsComponent,
    AdListCommonStateModule,
    NgIf,
    DecimalPipe,
    AsyncPipe,
    DatePipe,
    NgLetDirective,
  ],
  selector: 'app-ad-list-page',
  standalone: true,
  styleUrls: ['./ad-list-page.component.scss'],
  templateUrl: './ad-list-page.component.html',
})
export class AdListPageComponent implements OnInit, OnDestroy {
  public element$: Observable<AdModel | null> = this.adDetailsFacade.elements$;
  public loading$: Observable<Record<string, boolean>> =
    this.adDetailsFacade.loading$;
  public hasData$: Observable<boolean> = this.adDetailsFacade.hasData$;

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
    private readonly adDetailsFacade: AdDetailsFacade
  ) {}

  ngOnInit() {
    const adId = this.route.snapshot.paramMap.get('id');

    this.currentUserId = this.authService.getUserId();

    if (adId) {
      this.adDetailsFacade.load(adId);
    }

    this.element$.pipe(takeUntil(this.destroy$)).subscribe((ad) => {
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
    this.element$.pipe(takeUntil(this.destroy$)).subscribe((ad) => {
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
