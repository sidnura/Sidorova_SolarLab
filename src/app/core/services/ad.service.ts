import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AdModel, AdSearchRequestModel } from '../models/ad.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AdService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  // Получить URL изображения по ID
  public getImageUrl(imageId: string): string {
    return `${this.apiUrl}/Images/${imageId}`;
  }

  getFirstImageUrl(ad: AdModel): string | null {
    if (ad.imagesIds && ad.imagesIds.length > 0) {
      return this.getImageUrl(ad.imagesIds[0]);
    }
    return null;
  }

  getAllImageUrls(ad: AdModel): string[] {
    if (ad.imagesIds && ad.imagesIds.length > 0) {
      return ad.imagesIds.map((imageId) => this.getImageUrl(imageId));
    }
    return [];
  }

  // Создать новое объявление
  createAd(adData: FormData): Observable<AdModel> {
    const url = `${this.apiUrl}/Advert`;

    return this.http.post<AdModel>(url, adData).pipe(
      tap((response) => console.log('Объявление создано успешно:', response)),
      catchError(this.handleError)
    );
  }

  // Обновление объявления
  updateAdWithFormData(adId: string, formData: FormData): Observable<AdModel> {
    const url = `${this.apiUrl}/Advert/${adId}`;

    return this.http
      .put<AdModel>(url, formData)
      .pipe(catchError(this.handleError));
  }

  getAds(): Observable<AdModel[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const searchParams: AdSearchRequestModel = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    return this.http
      .post<AdModel[]>(url, searchParams)
      .pipe(catchError(this.handleError));
  }

  // Поиск объявлений
  searchAds(searchParams: AdSearchRequestModel): Observable<AdModel[]> {
    const url = `${this.apiUrl}/Advert/search`;
    const paramsWithSorting: AdSearchRequestModel = {
      ...searchParams,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    return this.http
      .post<AdModel[]>(url, paramsWithSorting)
      .pipe(catchError(this.handleError));
  }

  getAdById(id: string): Observable<AdModel> {
    const url = `${this.apiUrl}/Advert/${id}`;
    return this.http.get<AdModel>(url).pipe(catchError(this.handleError));
  }

  deleteAd(adId: string): Observable<any> {
    const url = `${this.apiUrl}/Advert/${adId}`;
    return this.http.delete(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
