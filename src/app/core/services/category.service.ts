import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  getAllCategories(): Observable<Category[]> {
    const url = `${this.apiUrl}/Categories`;
    
    return this.http.get<Category[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return of([]);
      })
    );
  }

  getParentCategories(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c =>
        c.parentId === '00000000-0000-0000-0000-000000000000' || !c.parentId
      )),
      catchError((error: HttpErrorResponse) => {
        return of([]);
      })
    );
  }

  getChildCategories(parentId: string): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c => c.parentId === parentId)),
      catchError((error: HttpErrorResponse) => {
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