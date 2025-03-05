import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Administrador } from '../models/administrador.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.administrador}`;

  constructor(private http: HttpClient) {}

  cadastrarAdministrador(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(this.baseUrl, admin);
  }

  listarAdministradores(pageable: any): Observable<Page<Administrador>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Administrador>>(`${this.baseUrl}`, { params });
  }  

  buscarAdministradorPorId(id: number): Observable<Administrador> {
    return this.http.get<Administrador>(`${this.baseUrl}/${id}`);
  }

  atualizarAdministrador(id: number, admin: Administrador): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.baseUrl}/${id}`, admin);
  }

  excluirAdministrador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
