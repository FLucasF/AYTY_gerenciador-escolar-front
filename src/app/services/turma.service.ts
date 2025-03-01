import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../models/turma.model';
import { Aluno } from '../models/aluno.model';
import { tap } from 'rxjs/operators';
import { Page } from '../models/page.model'; // Interface de paginação

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  turmas: Turma[] = [];
  private apiUrl = 'http://localhost:8090/turmas';

  constructor(private http: HttpClient) {}

  // Listar alunos de uma turma
  listarAlunosPorTurma(turmaId: number, pageable: any): Observable<Page<Aluno>> {
    return this.http.get<Page<Aluno>>(`${this.apiUrl}/${turmaId}/alunos`, { params: pageable });
  }

  // Listar turmas para o PROFESSOR
  listarTurmasPorProfessor(professorId: number, pageable: any): Observable<Page<Turma>> {
    return this.http.get<Page<Turma>>(`${this.apiUrl}/professor/${professorId}`, { params: pageable });
  }

  listarTurmasPorAluno(alunoId: number, pageable: any): Observable<Page<Turma>> {
    return this.http.get<Page<Turma>>(`${this.apiUrl}/aluno/${alunoId}`, { params: pageable }).pipe(
      tap((res) => {
        console.log("✅ Turmas recebidas:", res.content);  // Aqui está mostrando os dados corretamente
        this.turmas = res.content;  // Atribuindo as turmas corretamente ao componente
      })
    );
  }

  buscarTurmaPorId(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.apiUrl}/${id}`);
  } 
  
  // Listar todas as turmas (geral - para ADMIN)
  listarTodasTurmas(pageable: any): Observable<Page<Turma>> {
    return this.http.get<Page<Turma>>(`${this.apiUrl}/geral`, { params: pageable });
  }

  // Criar nova turma
  adicionarTurma(turma: Partial<Turma>): Observable<Turma> {
    return this.http.post<Turma>(this.apiUrl, turma);
  }

  // Atualizar dados de uma turma
  atualizarTurma(id: number, turma: Partial<Turma>): Observable<Turma> {
    return this.http.put<Turma>(`${this.apiUrl}/${id}`, turma);
  }

  // Excluir uma turma
  excluirTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Matricular aluno em uma turma
  matricularAluno(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.post<Turma>(`${this.apiUrl}/${turmaId}/matricular/${alunoId}`, {});
  }

  // Remover aluno de uma turma
  removerAlunoDaTurma(turmaId: number, alunoId: number): Observable<Page<Aluno>> {
    return this.http.delete<Page<Aluno>>(`${this.apiUrl}/${turmaId}/remover/${alunoId}`);
  }
}
