import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Professor } from '../models/professor.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.professor}`;

  constructor(private http: HttpClient) {}

  cadastrarProfessor(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.baseUrl, professor);
  }
  
  listarProfessores(pageable: any): Observable<Page<Professor>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Professor>>(`${this.baseUrl}`, { params });
  }
  
  buscarProfessorPorId(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.baseUrl}/${id}`);
  }

  atualizarProfessor(id: number, professor: Professor): Observable<Professor> {
    return this.http.put<Professor>(`${this.baseUrl}/${id}`, professor);
  }

  excluirProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
