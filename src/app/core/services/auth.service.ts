import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface LoginRequestModel {
  login: string;
  password: string;
}

export interface RegisterRequestModel {
  login: string;
  email: string;
  password: string;
  name: string;
}

export interface AuthResponseModel {
  token: string;
  userId: string;
  login: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseApiURL;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(loginData: LoginRequestModel): Observable<AuthResponseModel> {
    const url = `${this.apiUrl}/Auth/Login`;

    return this.http.post<string>(url, loginData).pipe(
      map((token: string) => {
        const decodedToken = this.decodeJwt(token);

        return {
          token: token,
          userId: decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
          login: decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || loginData.login
        };
      }),
      tap((response: AuthResponseModel) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_id', response.userId);
          localStorage.setItem('user_login', response.login);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(registerData: RegisterRequestModel): Observable<AuthResponseModel> {
    const url = `${this.apiUrl}/Auth/Register`;

    return this.http.post<string>(url, registerData).pipe(
      map((token: string) => {
        const decodedToken = this.decodeJwt(token);

        return {
          token: token,
          userId: decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
          login: decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || registerData.login
        };
      }),
      tap((response: AuthResponseModel) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_id', response.userId);
          localStorage.setItem('user_login', response.login);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decodedToken = this.decodeJwt(token);
      const expiration = decodedToken?.exp * 1000;
      return Date.now() >= expiration;
    } catch (error) {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_login');
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getUserLogin(): string | null {
    return localStorage.getItem('user_login');
  }

  refreshAuthStatus(): void {
    const isLoggedIn = this.isLoggedIn();
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  isAdmin(): boolean {
    const userLogin = this.getUserLogin()?.toLowerCase();

    const adminLogins = [
      'admin2',
    ];

    return adminLogins.includes(userLogin || '');
  }
}
