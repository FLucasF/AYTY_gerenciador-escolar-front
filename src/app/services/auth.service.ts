import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

interface LoginResponse {
  usuario: any;
  accessToken: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.auth}`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  login(credentials: any): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials, { headers });
  }

  handleLoginResponse(response: any): void {
    console.log('Login realizado com sucesso:', response);

    if (!response?.accessToken || !response?.id) {
        console.error('Resposta inválida no login!', response);
        return;
    }

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userId', response.id.toString());
    localStorage.setItem('userEmail', response.email || '');

    const decoded = this.jwtHelper.decodeToken(response.accessToken);
    console.log('Token decodificado:', decoded);

    const userRole = response.role || (decoded?.role ? decoded.role.toUpperCase() : 'UNKNOWN');
    localStorage.setItem('role', userRole);
    console.log('Role salva:', userRole);
  }

  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  logout(): void {
    console.log('Logout realizado');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
