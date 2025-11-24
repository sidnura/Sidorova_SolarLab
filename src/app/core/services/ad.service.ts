import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Ad, AdSearchRequestDto } from '../models/ad.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AdService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

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
      return ad.imagesIds.map((imageId) => this.getImageUrl(imageId));
    }
    return [];
  }

  // Создать новое объявление
  createAd(adData: FormData): Observable<Ad> {
    const url = `${this.apiUrl}/Advert`;

    return this.http.post<Ad>(url, adData).pipe(
      tap((response) => console.log('Объявление создано успешно:', response)),
      catchError(this.handleError)
    );
  }

  // Обновление объявления
  updateAdWithFormData(adId: string, formData: FormData): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${adId}`;

    return this.http.put<Ad>(url, formData).pipe(catchError(this.handleError));
  }

  getAds(): Observable<Ad[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const searchParams: AdSearchRequestDto = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    return this.http
      .post<Ad[]>(url, searchParams)
      .pipe(catchError(this.handleError));
  }

  // Поиск объявлений
  searchAds(searchParams: AdSearchRequestDto): Observable<Ad[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const paramsWithSorting: AdSearchRequestDto = {
      ...searchParams,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    return this.http
      .post<Ad[]>(url, paramsWithSorting)
      .pipe(catchError(this.handleError));
  }

  getAdById(id: string): Observable<Ad> {
    const url = `${this.apiUrl}/Advert/${id}`;

    return this.http.get<Ad>(url).pipe(catchError(this.handleError));
  }

  deleteAd(adId: string): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}`;

    return this.http.delete(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
