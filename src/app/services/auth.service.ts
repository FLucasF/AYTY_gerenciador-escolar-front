import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string; // Managed via cookie in the backend
  userId: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.auth}`;
  // In-memory session data (we persist only the access token)
  private accessToken: string | null = null;
  private userId: number | null = null;
  private role: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    // Attempt to load the token from sessionStorage during initialization.
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUserId = sessionStorage.getItem('userId');
    const storedRole = sessionStorage.getItem('role');
    if (storedToken && storedUserId && storedRole) {
      this.accessToken = storedToken;
      this.userId = Number(storedUserId);
      this.role = storedRole;
    }
  }

  /** Attempts to restore session using the stored access token */
  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      // If there is a token in sessionStorage and it's not expired, consider session restored.
      if (this.accessToken && !this.jwtHelper.isTokenExpired(this.accessToken)) {
        console.log("Sessão restaurada a partir do sessionStorage.");
        resolve(true);
      } else {
        // Otherwise, try to refresh the token.
        this.refreshTokenRequest().subscribe({
          next: (response: AuthenticationResponse) => {
            console.log("Sessão restaurada via refresh!", response);
            this.setSession(response.accessToken, response.userId, response.role);
            resolve(true);
          },
          error: (err) => {
            console.warn("Sessão expirada ou erro ao restaurar token", err);
            this.logout();
            resolve(false);
          }
        });
      }
    });
  }

  /** Logs in the user */
  login(credentials: { email: string; senha: string }): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log("[AuthService] Login bem-sucedido!", response);
        this.setSession(response.accessToken, response.userId, response.role);
      }),
      catchError(error => {
        console.error("❌ Erro ao fazer login:", error);
        return throwError(() => error);
      })
    );
  }

  /** Calls the refresh endpoint to update the access token */
  refreshTokenRequest(): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log("🔄 Token atualizado!", response);
        this.setSession(response.accessToken, response.userId, response.role);
      }),
      catchError(error => {
        console.error("❌ Erro ao renovar token:", error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /** Stores the session data in memory and persists the access token in sessionStorage */
  setSession(accessToken: string, userId: number, role: string): void {
    this.accessToken = accessToken;
    this.userId = userId;
    this.role = role;
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userId', userId.toString());
    sessionStorage.setItem('role', role);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getUserRole(): string | null {
    return this.role;
  }

  isLoggedIn(): boolean {
    return this.accessToken !== null && !this.jwtHelper.isTokenExpired(this.accessToken);
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => console.log("Logout realizado no backend"),
      error: err => console.error("Erro no logout:", err)
    });
    // Clear in-memory session data and sessionStorage, then navigate to login.
    this.accessToken = null;
    this.userId = null;
    this.role = null;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
