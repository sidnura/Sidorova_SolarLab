import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  clearLocalAds(): void {
    localStorage.removeItem('localCreatedAds');
    console.log('🗑️ Локальные объявления очищены');
  }

  getLocalAds(): any[] {
    const savedAds = localStorage.getItem('localCreatedAds');
    return savedAds ? JSON.parse(savedAds) : [];
  }

  saveLocalAds(ads: any[]): void {
    localStorage.setItem('localCreatedAds', JSON.stringify(ads));
  }
}