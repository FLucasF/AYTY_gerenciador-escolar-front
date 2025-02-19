import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Administrador } from '../../models/administrador.model';
import { Professor } from '../../models/professor.model';
import { Aluno } from '../../models/aluno.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarAdministradores(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(`${this.apiUrl}/administradores`);
  }

  listarProfessores(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.apiUrl}/professores`);
  }

  listarAlunos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${this.apiUrl}/alunos`);
  }

  cadastrarAdministrador(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(`${this.apiUrl}/administradores`, admin);
  }

  cadastrarProfessor(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(`${this.apiUrl}/professores`, professor);
  }

  cadastrarAluno(aluno: Aluno): Observable<Aluno> {
    return this.http.post<Aluno>(`${this.apiUrl}/alunos`, aluno);
  }

  excluirAdministrador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/administradores/${id}`);
  }

  excluirProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/professores/${id}`);
  }

  excluirAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alunos/${id}`);
  }
}
