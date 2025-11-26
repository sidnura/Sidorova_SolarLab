import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { UserModel, ShortUserModel, UpdateUserRequestModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.baseApiURL;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  getUsers(): Observable<ShortUserModel[]> {
    const url = `${this.apiUrl}/Users`;
    return this.http.get<ShortUserModel[]>(url).pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<UserModel> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.get<UserModel>(url).pipe(catchError(this.handleError));
  }

  getCurrentUser(): Observable<UserModel> {
    const url = `${this.apiUrl}/Users/current`;
    return this.http.get<UserModel>(url).pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: UpdateUserRequestModel): Observable<ShortUserModel> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.put<ShortUserModel>(url, userData).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    const url = `${this.apiUrl}/Users/${id}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }
}
