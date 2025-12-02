import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AdModel } from '@models/ad.model';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentsComponent } from '../../../shared/components/comments/comments.component';
import { HexagonImageComponent } from '../../../shared/components/hexagon-image/hexagon-image.component';
import { AdDetailsFacade } from '../../../store/ad-list-common-state/ad-details-state/ad-details.facade';
import { AdListCommonStateModule } from '../../../store/ad-list-common-state/ad-list-common-state.module';

@Component({
  imports: [
    RouterModule,
    CommentsComponent,
    HexagonImageComponent,
    DecimalPipe,
    AsyncPipe,
    DatePipe,
    AdListCommonStateModule,
  ],
  selector: 'app-ad-details-page',
  standalone: true,
  styleUrls: ['./ad-details-page.component.scss'],
  templateUrl: './ad-details-page.component.html',
})
export class AdDetailsPageComponent implements OnInit, OnDestroy {
  public element$: Observable<AdModel | null> = this.adDetailsFacade.elements$;
  public loading$: Observable<Record<string, boolean>> =
    this.adDetailsFacade.loading$;
  public hasData$: Observable<boolean> = this.adDetailsFacade.hasData$;

  showPhone = false;
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

  nextImage(): void {
    this.element$.pipe(takeUntil(this.destroy$)).subscribe((ad) => {
      if (ad && ad.imagesIds && ad.imagesIds.length > 0) {
        this.currentImageIndex =
          (this.currentImageIndex + 1) % ad.imagesIds.length;
      }
    });
  }

  prevImage(): void {
    this.element$.pipe(takeUntil(this.destroy$)).subscribe((ad) => {
      if (ad && ad.imagesIds && ad.imagesIds.length > 0) {
        this.currentImageIndex =
          (this.currentImageIndex - 1 + ad.imagesIds.length) %
          ad.imagesIds.length;
      }
    });
  }

  getPhoneNumber(ad: AdModel): string {
    return ad?.phone || '+7 (999) 123-45-67';
  }
}
