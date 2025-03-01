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
  
    const token = response.accessToken;
    if (!token) {
      console.error('❌ Token de acesso não encontrado!');
      return;
    }
  
    // Decodifica o token para extrair a role, se disponível
    const decoded = this.jwtHelper.decodeToken(token);
    console.log('🔍 Token decodificado:', decoded);
  
    let userRole = response.usuario.role || (decoded?.role ? decoded.role.toUpperCase() : null);
  
    if (userRole) {
      localStorage.setItem('role', userRole);
      console.log('🎭 Role salva:', userRole);
    } else {
      console.error('⚠️ Role não encontrada no usuário nem no token!');
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
