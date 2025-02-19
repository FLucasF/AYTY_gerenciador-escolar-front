import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Professor } from '../../models/professor.model';
import { environment } from '../../../environments/environment.development';
import { Turma } from '../../models/turma.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private baseUrl = `${environment.apiUrl}/professores`;

  constructor(private http: HttpClient) {}

  listarProfessores(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.baseUrl);
  }

  buscarProfessorPorId(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.baseUrl}/${id}`);
  }

  cadastrarProfessor(professor: Professor): Observable<Professor> {
    const professorDTO = this.createProfessorDTO(professor);
    return this.http.post<Professor>(this.baseUrl, professorDTO);
  }

  atualizarProfessor(id: number, professor: Professor): Observable<Professor> {
    const professorDTO = this.createProfessorDTO(professor);
    return this.http.put<Professor>(`${this.baseUrl}/${id}`, professorDTO);
  }

  excluirProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private createProfessorDTO(professor: Professor) {
    return {
      id: professor.id,
      nome: professor.nome,
      email: professor.email,
      departamento: professor.departamento,
      turmas: professor.turmas?.map((turma: Turma) => turma.nome) || []
    };
  }
}
