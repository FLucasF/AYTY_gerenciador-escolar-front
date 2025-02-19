import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../../models/turma.model';
import { Aluno } from '../../models/aluno.model';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private apiUrl = 'http://localhost:8090/turmas';

  constructor(private http: HttpClient) {}

  listarTurmas(): Observable<Turma[]> {
    return this.http.get<Turma[]>(this.apiUrl);
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

  // Lista os alunos matriculados em uma turma (endpoint: GET /turmas/{turmaId}/alunos)
  listarAlunosPorTurma(turmaId: number): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.apiUrl}/${turmaId}/alunos`);
  }

  // Matricula um aluno na turma (endpoint: POST /turmas/{turmaId}/matricular/{alunoId})
  matricularAluno(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.post<Turma>(`${this.apiUrl}/${turmaId}/matricular/${alunoId}`, {});
  }

  // Remove um aluno da turma (endpoint: DELETE /turmas/{turmaId}/remover/{alunoId})
  removerAlunoDaTurma(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.delete<Turma>(`${this.apiUrl}/${turmaId}/remover/${alunoId}`);
  }
}
