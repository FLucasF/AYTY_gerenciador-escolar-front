import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse } from '../models/auth-response';

// export interface AuthenticationResponse {
//   accessToken: string;
//   userId: number;
//   role: string;
// }

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

/**
   * Restaura a sessão verificando o token de acesso.
   * Este método verifica se o token de acesso armazenado no sessionStorage está presente e válido.
   * Caso o token esteja expirado ou não exista, o usuário será redirecionado para a tela de login.
   * 
   * @returns Promise<boolean> - Retorna uma Promise que resolve para `true` se a sessão for restaurada, ou `false` caso contrário.
   */  initializeAuth(): Promise<boolean> {
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
  
 /**
   * Realiza o login do usuário.
   * Este método realiza uma requisição POST para autenticar o usuário, passando suas credenciais (email e senha).
   * Se o login for bem-sucedido, ele armazena o token JWT e as informações do usuário no sessionStorage.
   * 
   * @param credentials - Objeto contendo o email e senha do usuário.
   * @returns Observable<AuthResponse> - Retorna um Observable contendo a resposta com o token, ID e role do usuário.
   */  login(credentials: { email: string; senha: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
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

   /**
   * Armazena a sessão no sessionStorage.
   * Este método armazena o token JWT, o ID e a role do usuário no sessionStorage para persistência de sessão.
   * 
   * @param accessToken - O token JWT de acesso.
   * @param userId - O ID do usuário autenticado.
   * @param role - A role do usuário (ex: 'admin', 'user').
   */
  setSession(accessToken: string, userId: number, role: string): void {
    this.accessToken = accessToken;
    this.userId = userId;
    this.role = role;
    
    // Salvar no sessionStorage
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userId', userId.toString());
    sessionStorage.setItem('role', role);
  }


  /**
   * Obtém o token de acesso armazenado no sessionStorage.
   * 
   * @returns string | null - Retorna o token de acesso armazenado ou `null` se o usuário não estiver autenticado.
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Obtém o ID do usuário armazenado no sessionStorage.
   * 
   * @returns number | null - Retorna o ID do usuário ou `null` caso não esteja autenticado.
   */
  getUserId(): number | null {
    return this.userId;
  }

  /**
   * Obtém a role do usuário armazenada no sessionStorage.
   * 
   * @returns string | null - Retorna a role do usuário ou `null` caso não esteja autenticado.
   */
  getUserRole(): string | null {
    return this.role;
  }

  /**
   * Verifica se o usuário está logado.
   * Este método verifica se o token JWT está presente e se não está expirado, indicando que o usuário está autenticado.
   * 
   * @returns boolean - Retorna `true` se o usuário estiver logado e o token não expirou, caso contrário, retorna `false`.
   */
  isLoggedIn(): boolean {
    return this.accessToken !== null && !this.jwtHelper.isTokenExpired(this.accessToken);
  }

  /**
   * Realiza o logout do usuário.
   * Este método invalida a sessão tanto no frontend quanto no backend.
   * Limpa as informações do sessionStorage e redireciona o usuário para a tela de login.
   */
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