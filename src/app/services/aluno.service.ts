import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private baseUrl = 'http://localhost:8090/alunos';

  constructor(private http: HttpClient) {}

  cadastrarAluno(aluno: Aluno): Observable<Aluno> {
    return this.http.post<Aluno>(this.baseUrl, aluno);
  }

  listarAlunos(page: number = 0, size: number = 10): Observable<Page<Aluno>> {
    return this.http.get<Page<Aluno>>(`${this.baseUrl}?page=${page}&size=${size}`);
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
