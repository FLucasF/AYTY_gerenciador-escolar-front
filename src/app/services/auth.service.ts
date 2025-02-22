// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

interface LoginResponse {
  usuario: any;
  accessToken: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Defina a URL da sua API de autenticação (ajuste conforme necessário)
  private apiUrl = 'http://localhost:8090/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  // Método de login: envia as credenciais para o backend
  login(credentials: any): Observable<LoginResponse> {
    console.log('🔐 Tentando login com:', credentials);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, { headers });
  }

  // Processa a resposta do login: armazena o token e decodifica para extrair a role
  handleLoginResponse(response: LoginResponse): void {
    console.log('✅ Login realizado com sucesso:', response);
    const token = response.accessToken;
    if (!token) {
      console.error('❌ Token de acesso não encontrado!');
      return;
    }
    // Salva o token e refreshToken no localStorage
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', response.refreshToken || '');

    // Decodifica o token para extrair a role
    const decoded = this.jwtHelper.decodeToken(token);
    console.log('🔍 Token decodificado:', decoded);
    if (decoded && decoded.role) {
      localStorage.setItem('role', decoded.role);
      console.log('🎭 Role extraída do token:', decoded.role);
    } else {
      console.error('⚠️ Role não encontrada no token! Verifique o payload.');
    }
  }

  // Retorna a role armazenada no localStorage
  getUserRole(): string {
    const role = localStorage.getItem('role');
    console.log('🎭 Role obtida do localStorage:', role);
    return role ? role : '';
  }

  // Realiza logout limpando os dados armazenados e redirecionando para o login
  logout(): void {
    console.log('🚪 Logout realizado');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
