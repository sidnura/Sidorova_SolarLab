import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { User, ShortUser, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  getUsers(): Observable<ShortUser[]> {
    const url = `${this.apiUrl}/Users`;
    return this.http.get<ShortUser[]>(url).pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.get<User>(url).pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<User> {
    const url = `${this.apiUrl}/Users/current`;
    return this.http.get<User>(url).pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<ShortUser> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.put<ShortUser>(url, userData).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }
}