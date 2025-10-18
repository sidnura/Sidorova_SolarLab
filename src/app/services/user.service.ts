// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { User, ShortUser, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error(' UserService HTTP Error:', error);
    console.error(' Error details:', error.error);
    return throwError(() => error);
  }

  getUsers(): Observable<ShortUser[]> {
    const url = `${this.apiUrl}/Users`;
    console.log('Загрузка списка пользователей:', url);
    
    return this.http.get<ShortUser[]>(url)
      .pipe(
        tap(users => console.log(' Пользователи загружены:', users)),
        catchError(this.handleError)
      );
  }

  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/Users/${id}`;
    console.log('Загрузка пользователя по ID:', url);
    
    return this.http.get<User>(url)
      .pipe(
        tap(user => console.log('Пользователь загружен:', user)),
        catchError(this.handleError)
      );
  }

  getCurrentUser(): Observable<User> {
    const url = `${this.apiUrl}/Users/current`;
    console.log('Загрузка текущего пользователя:', url);
    
    return this.http.get<User>(url)
      .pipe(
        tap(user => console.log('Текущий пользователь загружен:', user)),
        catchError(this.handleError)
      );
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<ShortUser> {
    const url = `${this.apiUrl}/Users/${id}`;
    console.log('📤 Обновление пользователя:', url);
    console.log('📝 Данные для обновления:', userData);
    
    return this.http.put<ShortUser>(url, userData)
      .pipe(
        tap(user => console.log('Пользователь обновлен:', user)),
        catchError(this.handleError)
      );
  }

  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl}/Users/${id}`;
    console.log('Удаление пользователя:', url);
    
    return this.http.delete<void>(url)
      .pipe(
        tap(() => console.log('Пользователь удален')),
        catchError(this.handleError)
      );
  }
}