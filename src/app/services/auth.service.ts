import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AuthenticationResponse {
  accessToken: string;
  userId: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.auth}`;
  private accessToken: string | null = null;
  private userId: number | null = null;
  private role: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    // Tenta carregar o token armazenado no sessionStorage
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUserId = sessionStorage.getItem('userId');
    const storedRole = sessionStorage.getItem('role');
    if (storedToken && storedUserId && storedRole) {
      this.accessToken = storedToken;
      console.log("Token de acesso encontrado no sessionStorage.", this.accessToken);
      this.userId = Number(storedUserId);
      this.role = storedRole;
    }
  }

  /** Restaura a sessão verificando o token de acesso */
  initializeAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      // Verifica se o token de acesso está presente e não expirado
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken && !this.jwtHelper.isTokenExpired(accessToken)) {
        console.log("Sessão restaurada a partir do sessionStorage.");
        resolve(true);
      } else {
        console.warn("Sessão não restaurada. Redirecionando para login.");
        resolve(false);
      }
    });
  }
  
  
  /** Realiza o login do usuário */
  login(credentials: { email: string; senha: string }): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log("[AuthService] Login bem-sucedido!", response);
        this.setSession(response.accessToken, response.userId, response.role);
        console.log("Token de acesso:", this.accessToken);
        console.log("ID do usuário:", this.userId);
        console.log("Role do usuário:", this.role);
      }),
      catchError(error => {
        console.error("❌ Erro ao fazer login:", error);
        return throwError(() => error);
      })
    );
  }

  setSession(accessToken: string, userId: number, role: string): void {
    this.accessToken = accessToken;
    this.userId = userId;
    this.role = role;
    
    // Salvar no sessionStorage
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userId', userId.toString());
    sessionStorage.setItem('role', role);
  }
  
  

  /** Obtém o token de acesso armazenado */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /** Obtém o ID do usuário */
  getUserId(): number | null {
    return this.userId;
  }

  /** Obtém a role do usuário */
  getUserRole(): string | null {
    return this.role;
  }

  /** Verifica se o usuário está logado */
  isLoggedIn(): boolean {
    return this.accessToken !== null && !this.jwtHelper.isTokenExpired(this.accessToken);
  }

  /** Realiza o logout */
  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => console.log("Logout realizado no backend"),
      error: err => console.error("Erro no logout:", err)
    });
  
    // Limpar dados da sessão no sessionStorage
    this.accessToken = null;
    this.userId = null;
    this.role = null;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
  
}
