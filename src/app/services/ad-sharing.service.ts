import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ad } from '../models/ad.model';

export interface SearchParams {
  search: string;
  category?: string;
  showNonActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdSharingService {
  private newAdSubject = new BehaviorSubject<Ad | null>(null);
  public newAd$: Observable<Ad | null> = this.newAdSubject.asObservable();

  private searchParamsSubject = new BehaviorSubject<SearchParams | null>(null);
  public searchParams$: Observable<SearchParams | null> = this.searchParamsSubject.asObservable();

  notifyNewAd(ad: Ad): void {
    console.log('AdSharingService: Новое объявление получено:', ad);
    this.newAdSubject.next(ad);
  }

  notifySearchParams(params: SearchParams): void {
    console.log('AdSharingService: Параметры поиска установлены:', params);
    this.searchParamsSubject.next(params);
  }

  clearNewAd(): void {
    this.newAdSubject.next(null);
  }

  clearSearchParams(): void {
    this.searchParamsSubject.next(null);
  }
}