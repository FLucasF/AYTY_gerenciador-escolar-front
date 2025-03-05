import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../models/turma.model';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.turma}`;

  constructor(private http: HttpClient) {}

  listarAlunosPorTurma(turmaId: number, pageable: any): Observable<Page<Aluno>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Aluno>>(`${this.baseUrl}/${turmaId}/alunos`, { params });
  }

  listarTurmasPorProfessor(professorId: number, pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/professor/${professorId}`, { params });
  }

  listarTurmasPorAluno(alunoId: number, pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/aluno/${alunoId}`, { params });
  }

  buscarTurmaPorId(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.baseUrl}/${id}`);
  } 
  
  listarTodasTurmas(pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/geral`, { params });
  }

  adicionarTurma(turma: Partial<Turma>): Observable<Turma> {
    return this.http.post<Turma>(this.baseUrl, turma);
  }

  atualizarTurma(id: number, turma: Partial<Turma>): Observable<Turma> {
    return this.http.put<Turma>(`${this.baseUrl}/${id}`, turma);
  }

  excluirTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  matricularAluno(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.post<Turma>(`${this.baseUrl}/${turmaId}/matricular/${alunoId}`, {});
  }

  removerAlunoDaTurma(turmaId: number, alunoId: number): Observable<Page<Aluno>> {
    return this.http.delete<Page<Aluno>>(`${this.baseUrl}/${turmaId}/remover/${alunoId}`);
  }
}
