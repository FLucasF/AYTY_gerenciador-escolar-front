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
  private apiUrl = 'http://localhost:8090';
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
            return user;
          }
        });
        return page;
      })
    );
  }
}
