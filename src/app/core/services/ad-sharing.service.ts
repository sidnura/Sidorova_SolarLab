import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AdModel } from '../models/ad.model';

export interface SearchParamsModel {
  search: string;
  category?: string;
  showNonActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdSharingService {
  private newAdSubject = new BehaviorSubject<AdModel | null>(null);
  private searchParamsSubject = new BehaviorSubject<SearchParamsModel | null>(null);
  public searchParams$: Observable<SearchParamsModel | null> =
    this.searchParamsSubject.asObservable();

  public get newAd$(): Observable<AdModel | null> {
    return this.newAdSubject.asObservable();
  }

  notifyNewAd(ad: AdModel): void {
    this.newAdSubject.next(ad);
  }

  notifySearchParams(params: SearchParamsModel): void {
    this.searchParamsSubject.next(params);
  }

  clearNewAd(): void {
    this.newAdSubject.next(null);
  }

  clearSearchParams(): void {
    this.searchParamsSubject.next(null);
  }
}
