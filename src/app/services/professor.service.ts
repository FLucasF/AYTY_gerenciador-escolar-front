import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Professor } from '../models/professor.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private baseUrl = 'http://localhost:8090/professores'; // 🔹 Ajuste sua URL da API se necessário

  constructor(private http: HttpClient) {}

  cadastrarProfessor(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.baseUrl, professor);
  }

  listarProfessores(page: number = 0, size: number = 10): Observable<Page<Professor>> {
    return this.http.get<Page<Professor>>(`${this.baseUrl}?page=${page}&size=${size}`);
  }

  buscarProfessorPorId(id: number): Observable<Professor> { // 🔹 Método adicionado
    return this.http.get<Professor>(`${this.baseUrl}/${id}`);
  }

  atualizarProfessor(id: number, professor: Professor): Observable<Professor> { // 🔹 Método adicionado
    return this.http.put<Professor>(`${this.baseUrl}/${id}`, professor);
  }

  excluirProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
