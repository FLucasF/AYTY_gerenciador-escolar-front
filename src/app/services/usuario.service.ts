import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Aluno } from '../models/aluno.model';
import { Professor } from '../models/professor.model';
import { Administrador } from '../models/administrador.model';
import { Page } from '../models/page.model';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.usuario}`;

  constructor(private http: HttpClient) { }

  /**
 * Listar todos os usuários com paginação e ordenação
 * 
 * Este método realiza uma requisição GET para obter todos os usuários cadastrados no sistema. 
 * Ele utiliza parâmetros de paginação e ordenação para controlar os resultados retornados pela API.
 * Após a recuperação dos usuários, o método transforma os dados com base na **role** do usuário 
 * (Aluno, Professor ou Administrador), convertendo o tipo de dado conforme necessário.
 * 
 * @param page - Número da página a ser retornada (padrão é 0).
 * @param size - Número de itens por página (padrão é 10).
 * @param sort - Critério de ordenação, podendo ser um ou mais campos seguidos de `,asc` ou `,desc` (padrão é 'nome,asc').
 * @returns Observable<Page<Usuario>> - Retorna um Observable contendo uma página de usuários (do tipo `Usuario` ou subclasses).
 */
  listarUsuarios(page: number = 0, size: number = 10, sort: string = 'nome,asc'): Observable<Page<Usuario>> {
    let params = new HttpParams()
      .set('page', page.toString())  // Define o número da página.
      .set('size', size.toString())  // Define o tamanho da página (quantidade de itens por página).
      .set('sort', sort);            // Define o critério de ordenação dos dados.

    return this.http.get<Page<Usuario>>(this.baseUrl, { params }).pipe(
      map(page => {
        // Verifica o "role" de cada usuário e os converte para o tipo correto (Aluno, Professor ou Administrador).
        page.content = page.content.map(user => {
          if (user.role === 'ROLE_ALUNO') {
            return user as Aluno;      // Converte para o tipo "Aluno".
          } else if (user.role === 'ROLE_PROFESSOR') {
            return user as Professor;  // Converte para o tipo "Professor".
          } else if (user.role === 'ROLE_ADMIN') {
            return user as Administrador; // Converte para o tipo "Administrador".
          } else {
            return user;  // Caso o role seja outro, retorna o usuário original.
          }
        });
        return page;  // Retorna a página de usuários com os tipos corretamente convertidos.
      })
    );
  }

}
