import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Ad } from '../models/ad.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('🚨 AdService HTTP Error:', error);
    return throwError(() => error);
  }

  createAd(adData: FormData): Observable<Ad> {
    const url = `${this.apiUrl}/Advert`;
    console.log('📤 Отправка POST запроса на создание объявления:', url);
    
    return this.http.post<Ad>(url, adData)
      .pipe(
        tap(response => console.log('✅ Объявление создано успешно:', response)),
        catchError(this.handleError)
      );
  }

  getAds(): Observable<Ad[]> {
    const url = `${this.apiUrl}/Advert/search`;
    console.log('📥 Загрузка списка объявлений с:', url);
    
    return this.http.post<Ad[]>(url, {})
      .pipe(
        tap(ads => console.log('✅ Получены объявления:', ads)),
        catchError(this.handleError)
      );
  }

  getAdById(id: string): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${id}`;
    console.log('📥 Загрузка объявления с ID:', id, 'URL:', url);
    
    return this.http.get<Ad>(url)
      .pipe(
        tap(ad => console.log('✅ Получено объявление:', ad)),
        catchError(this.handleError)
      );
  }

  deleteAd(adId: string): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}`;
    console.log('🗑️ Отправка DELETE запроса для объявления ID:', adId);
    
    return this.http.delete(url)
      .pipe(
        tap(() => console.log('✅ Запрос на удаление отправлен для ID:', adId)),
        catchError(this.handleError)
      );
  }
}