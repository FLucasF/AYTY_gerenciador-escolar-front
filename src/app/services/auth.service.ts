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
  private apiUrl = 'http://localhost:8090/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  

  login(credentials: any): Observable<LoginResponse> {
    console.log('🔐 Tentando login com:', credentials);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, { headers });
  }

  handleLoginResponse(response: LoginResponse): void {
    console.log('✅ Login realizado com sucesso:', response);

    console.log('✅ Salvando dados no localStorage:', response);
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('userId', response.usuario.id.toString());
  localStorage.setItem('userName', response.usuario.nome);
  localStorage.setItem('role', response.usuario.role);
  
    const token = response.accessToken;
    if (!token) {
      console.error('❌ Token de acesso não encontrado!');
      return;
    }

    // Salva os tokens no localStorage
    localStorage.setItem('accessToken', token);
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    // Decodifica o token para extrair a role
    const decoded = this.jwtHelper.decodeToken(token);
    console.log('🔍 Token decodificado:', decoded);
    if (decoded && decoded.role) {
      localStorage.setItem('role', decoded.role.toUpperCase()); // Garantindo uppercase
      console.log('🎭 Role extraída do token:', decoded.role);
    } else {
      console.error('⚠️ Role não encontrada no token!');
    }
  }

  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  logout(): void {
    console.log('🚪 Logout realizado');
    localStorage.clear(); // Limpa tudo do localStorage
    this.router.navigate(['/login']);
  }
}
