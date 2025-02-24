import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Aluno } from '../models/aluno.model';
import { Professor } from '../models/professor.model';
import { Administrador } from '../models/administrador.model';
import { Page } from '../models/page.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8090'; // 🔹 Defina manualmente sua URL da API
  private baseUrl = `${this.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(page: number = 0, size: number = 10, sort: string = 'nome,asc'): Observable<Page<Usuario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<Usuario>>(this.baseUrl, { params }).pipe(
      map(page => {
        page.content = page.content.map(user => {
          if (user.role === 'ROLE_ALUNO') {
            return user as Aluno;
          } else if (user.role === 'ROLE_PROFESSOR') {
            return user as Professor;
          } else if (user.role === 'ROLE_ADMIN') {
            return user as Administrador;
          } else {
            return user; // Caso não se encaixe, mantém como Usuario genérico
          }
        });
        return page;
      })
    );
  }

  buscarUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`).pipe(
      map(user => {
        if (user.role === 'ROLE_ALUNO') {
          return user as Aluno;
        } else if (user.role === 'ROLE_PROFESSOR') {
          return user as Professor;
        } else if (user.role === 'ROLE_ADMIN') {
          return user as Administrador;
        } else {
          return user;
        }
      })
    );
  }

  /**
   * Atualiza um usuário baseado no seu tipo (Aluno, Professor ou Administrador)
   */
  atualizarUsuario(usuario: Usuario): Observable<Usuario> {
    let updateUrl = '';

    switch (usuario.role) {
      case 'ROLE_ALUNO':
        updateUrl = `${this.apiUrl}/alunos/${usuario.id}`;
        return this.http.put<Aluno>(updateUrl, usuario as Aluno);
      case 'ROLE_PROFESSOR':
        updateUrl = `${this.apiUrl}/professores/${usuario.id}`;
        return this.http.put<Professor>(updateUrl, usuario as Professor);
      case 'ROLE_ADMIN':
        updateUrl = `${this.apiUrl}/administradores/${usuario.id}`;
        return this.http.put<Administrador>(updateUrl, usuario as Administrador);
      default:
        throw new Error(`Tipo de usuário desconhecido: ${usuario.role}`);
    }
  }
}
