import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Administrador } from '../models/administrador.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private baseUrl = 'http://localhost:8090/administradores';

  constructor(private http: HttpClient) {}

  cadastrarAdministrador(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(this.baseUrl, admin);
  }

  listarAdministradores(page: number = 0, size: number = 10): Observable<Page<Administrador>> {
     return this.http.get<Page<Administrador>>(`${this.baseUrl}?page=${page}&size=${size}`);
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
