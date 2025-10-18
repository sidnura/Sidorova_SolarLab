// services/ad.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { Ad, ShortAdDto, AdSearchRequestDto } from '../models/ad.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('AdService HTTP Error:', error);
    return throwError(() => error);
  }

  // Получить URL изображения по ID
  getImageUrl(imageId: string): string {
    return `${this.apiUrl}/Images/${imageId}`;
  }

  getFirstImageUrl(ad: Ad): string | null {
    if (ad.imagesIds && ad.imagesIds.length > 0) {
      return this.getImageUrl(ad.imagesIds[0]);
    }
    return null;
  }

  getAllImageUrls(ad: Ad): string[] {
    if (ad.imagesIds && ad.imagesIds.length > 0) {
      return ad.imagesIds.map(imageId => this.getImageUrl(imageId));
    }
    return [];
  }

  // Создать новое объявление
  createAd(adData: FormData): Observable<Ad> {
    const url = `${this.apiUrl}/Advert`;
    console.log('📤 Отправка POST запроса на создание объявления:', url);
    
    return this.http.post<Ad>(url, adData)
      .pipe(
        tap(response => console.log('Объявление создано успешно:', response)),
        catchError(this.handleError)
      );
  }

  // Обновление объявления 
  updateAdWithFormData(adId: string, formData: FormData): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${adId}`;
    
    console.log('📤 PUT запрос для обновления объявления с FormData:', url);
    console.log('🔍 Данные FormData:');
    for (let [key, value] of (formData as any).entries()) {
      console.log(`  - ${key}:`, value);
    }

    return this.http.put<Ad>(url, formData)
      .pipe(
        tap(response => console.log('Объявление обновлено успешно:', response)),
        catchError(this.handleError)
      );
  }

  // Старый метод для обратной совместимости (если нужен)
  updateAd(adId: string, adData: any): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${adId}`;
    console.log('PUT запрос для обновления объявления (JSON):', url);
    
    return this.http.put<Ad>(url, adData)
      .pipe(
        tap(response => console.log('✅ Объявление обновлено успешно:', response)),
        catchError(this.handleError)
      );
  }

  getAds(): Observable<Ad[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const searchParams: AdSearchRequestDto = {
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    console.log('Загрузка всех объявлений:', url);
    
    return this.http.post<Ad[]>(url, searchParams)
      .pipe(
        tap(ads => console.log('Все объявления загружены с сервера:', ads.length)),
        catchError(this.handleError)
      );
  }

  // Поиск объявлений
  searchAds(searchParams: AdSearchRequestDto): Observable<Ad[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const paramsWithSorting: AdSearchRequestDto = {
      ...searchParams,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    console.log('Отправка запроса поиска:', {
      url: url,
      params: paramsWithSorting
    });
    
    return this.http.post<Ad[]>(url, paramsWithSorting)
      .pipe(
        tap(ads => console.log('Результаты поиска с сервера:', ads.length, 'объявлений')),
        catchError(this.handleError)
      );
  }

  getAdById(id: string): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${id}`;
    return this.http.get<Ad>(url).pipe(catchError(this.handleError));
  }

  deleteAd(adId: string): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}`;
    return this.http.delete(url).pipe(catchError(this.handleError));
  }
}