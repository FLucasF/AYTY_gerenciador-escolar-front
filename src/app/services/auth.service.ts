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

  handleLoginResponse(response: any): void {
    console.log('✅ Login realizado com sucesso:', response);

    // ⚠️ Verifica se `id` e `accessToken` existem
    if (!response || !response.accessToken || !response.id) {
        console.error('❌ Resposta inválida no login!', response);
        return;
    }

    // Salvando no `localStorage`
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userId', response.id.toString()); // ✅ Agora salva `id` diretamente
    localStorage.setItem('userEmail', response.email || '');

    // Decodifica o token para extrair a role, se disponível
    const decoded = this.jwtHelper.decodeToken(response.accessToken);
    console.log('🔍 Token decodificado:', decoded);

    let userRole = response.role || (decoded?.role ? decoded.role.toUpperCase() : 'UNKNOWN');

    localStorage.setItem('role', userRole);
    console.log('🎭 Role salva:', userRole);
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
