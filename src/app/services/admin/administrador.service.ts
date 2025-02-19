import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Administrador } from '../../models/administrador.model';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private baseUrl = `${environment.apiUrl}/administradores`;

  constructor(private http: HttpClient) {}

  listarAdministradores(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(this.baseUrl);
  }

  cadastrarAdministrador(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(this.baseUrl, admin);
  }

  excluirAdministrador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
