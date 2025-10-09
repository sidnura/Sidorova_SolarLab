import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ad } from '../models/ad.model';

@Injectable({
  providedIn: 'root'
})
export class AdSharingService {
  private newAdSubject = new BehaviorSubject<Ad | null>(null);
  public newAd$: Observable<Ad | null> = this.newAdSubject.asObservable();

  notifyNewAd(ad: Ad): void {
    console.log('🔄 AdSharingService: Новое объявление получено:', ad);
    this.newAdSubject.next(ad);
  }

  clearNewAd(): void {
    this.newAdSubject.next(null);
  }
}