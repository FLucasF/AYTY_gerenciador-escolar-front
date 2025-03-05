import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mural } from '../models/mural.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.mural}`;

  constructor(private http: HttpClient) {}

  listarPostagens(turmaId: number, pageable: any): Observable<Page<Mural>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Mural>>(`${this.baseUrl}/turma/${turmaId}`, { params });
  }

  criarPostagem(mural: Mural): Observable<Mural> {
    return this.http.post<Mural>(this.baseUrl, mural);
  }

  atualizarPostagem(id: number, mural: Partial<Mural>): Observable<Mural> {
    return this.http.put<Mural>(`${this.baseUrl}/${id}`, mural);
  }

  excluirPostagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
