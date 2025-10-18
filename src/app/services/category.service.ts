import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, catchError, of } from 'rxjs'; // ← убрал tap
import { environment } from '../../environments/environment.development';

export interface Category {
  id: string;
  parentId: string;
  name: string;
  children?: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {
    console.log('🔗 CategoryService API URL:', this.apiUrl);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('CategoryService HTTP Error:', error);
    if (error.status === 404) {
      console.error('Endpoint не найден. Проверьте URL:', error.url);
    }
    return throwError(() => error);
  }

  getAllCategories(): Observable<Category[]> {
    const url = `${this.apiUrl}/Categories`;
    console.log('Загрузка категорий с:', url);
    
    return this.http.get<Category[]>(url).pipe(
      map(categories => {
        console.log('Категории успешно загружены:', categories);
        return categories;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка загрузки категорий:', error);
        console.error('URL запроса:', url);
        return of([]);
      })
    );
  }

  getParentCategories(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c =>
        c.parentId === '00000000-0000-0000-0000-000000000000' || !c.parentId
      )),
      map(categories => {
        console.log('📋 Родительские категории:', categories);
        return categories;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка фильтрации родительских категорий:', error);
        return of([]);
      })
    );
  }

  getChildCategories(parentId: string): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c => c.parentId === parentId)),
      map(categories => {
        console.log('Дочерние категории для', parentId, ':', categories);
        return categories;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Ошибка фильтрации дочерних категорий:', error);
        return of([]);
      })
    );
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.getAllCategories().pipe(
      map(categories => categories.find(c => c.id === id))
    );
  }

  getCategoryTree(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => {
        const mapById: { [id: string]: Category } = {};
        categories.forEach(cat => (mapById[cat.id] = { ...cat, children: [] }));

        const tree: Category[] = [];
        categories.forEach(cat => {
          if (cat.parentId === '00000000-0000-0000-0000-000000000000' || !cat.parentId) {
            tree.push(mapById[cat.id]);
          } else if (mapById[cat.parentId]) {
            mapById[cat.parentId].children!.push(mapById[cat.id]);
          }
        });
        return tree;
      })
    );
  }
}