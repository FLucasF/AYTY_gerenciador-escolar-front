import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string; // Esse valor virá no payload, mas a gestão real é via cookie.
  userId: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.auth}`;
  // Dados da sessão armazenados apenas em memória
  private accessToken: string | null = null;
  private userId: number | null = null;
  private role: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  /**
   * Tenta restaurar a sessão usando o refresh token (o cookie é enviado automaticamente)
   */
  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      this.refreshTokenRequest().subscribe({
        next: (response: AuthenticationResponse) => {
          console.log("✅ Sessão restaurada automaticamente!", response);
          this.setSession(response.accessToken, response.userId, response.role);
          resolve(true);
        },
        error: (err) => {
          console.warn("🚫 Sessão expirada ou erro ao restaurar token", err);
          this.logout();
          resolve(false);
        }
      });
    });
  }

  /** Realiza o login do usuário */
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

  /** Atualiza o access token disparando o endpoint de refresh */
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

  /** Define os dados da sessão (em memória) */
  setSession(accessToken: string, userId: number, role: string): void {
    this.accessToken = accessToken;
    this.userId = userId;
    this.role = role;
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
    // Limpa os dados da sessão em memória e redireciona
    this.accessToken = null;
    this.userId = null;
    this.role = null;
    this.router.navigate(['/login']);
  }
}
