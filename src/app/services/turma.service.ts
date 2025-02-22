import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../models/turma.model';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model'; // sua interface de Page

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private apiUrl = 'http://localhost:8090/turmas';

  constructor(private http: HttpClient) {}

  listarTurmas(): Observable<Page<Turma>> {
    return this.http.get<Page<Turma>>(this.apiUrl);
  }

  adicionarTurma(turma: any): Observable<Turma> {
    return this.http.post<Turma>(this.apiUrl, turma);
  }

  atualizarTurma(id: number, turma: any): Observable<Turma> {
    return this.http.put<Turma>(`${this.apiUrl}/${id}`, turma);
  }

  excluirTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarAlunosPorTurma(turmaId: number): Observable<Page<Aluno>> {
    return this.http.get<Page<Aluno>>(`${this.apiUrl}/${turmaId}/alunos`);
  }

  matricularAluno(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.post<Turma>(`${this.apiUrl}/${turmaId}/matricular/${alunoId}`, {});
  }

  removerAlunoDaTurma(turmaId: number, alunoId: number): Observable<Page<Aluno>> {
    return this.http.delete<Page<Aluno>>(`${this.apiUrl}/${turmaId}/remover/${alunoId}`);
  }
}
