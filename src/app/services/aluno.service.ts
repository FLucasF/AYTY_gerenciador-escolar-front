import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.aluno}`;

  constructor(private http: HttpClient) {}

  cadastrarAluno(aluno: Aluno): Observable<Aluno> {
    return this.http.post<Aluno>(this.baseUrl, aluno);
  }

  listarAlunos(pageable: any): Observable<Page<Aluno>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Aluno>>(`${this.baseUrl}`, { params });
  }
  

  buscarAlunoPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.baseUrl}/${id}`);
  }

  atualizarAluno(id: number, aluno: Aluno): Observable<Aluno> { 
    return this.http.put<Aluno>(`${this.baseUrl}/${id}`, aluno);
  }

  excluirAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
