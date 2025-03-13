import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError} from 'rxjs';
import { Professor } from '../models/professor.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.professor}`;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400) {
      Swal.fire({
        icon: 'warning',
        title: 'Erro nos dados',
        text: 'Veja se você enviou corretamente',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendi'
      });
    } else if (error.status === 404) {
      Swal.fire({
        icon: 'error',
        title: 'Professor não encontrado!',
        text: 'O professor que você está tentando acessar não existe.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    } else if (error.status === 409) {
      Swal.fire({
        icon: 'error',
        title: 'Conflito de Dados!',
        text: error.error.message || 'Já existe um professor cadastrado com esses dados.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendi'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro inesperado!',
        text: 'Ocorreu um problema ao processar sua solicitação.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }

    return throwError(() => error);
  }

  /**
 * Cadastrar um novo professor
 * 
 * Este método realiza uma requisição POST para cadastrar um novo professor no sistema.
 * 
 * @param professor - Dados do professor a ser cadastrado.
 * @returns Observable<Professor> - Retorna um Observable contendo os dados do professor cadastrado.
 */
  cadastrarProfessor(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.baseUrl, professor).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Listar professores com paginação
 * 
 * Este método realiza uma requisição GET para listar todos os professores cadastrados no sistema,
 * com base nos parâmetros de **paginamento** (como página, tamanho e ordenação).
 * 
 * @param pageable - Parâmetros de paginação, como número da página e tamanho da página.
 * @returns Observable<Page<Professor>> - Retorna um Observable contendo uma página de professores.
 */
  listarProfessores(pageable: any): Observable<Page<Professor>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Professor>>(`${this.baseUrl}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Buscar um professor por ID
 * 
 * Este método realiza uma requisição GET para buscar um professor específico, identificado pelo seu **ID**.
 * 
 * @param id - ID do professor a ser buscado.
 * @returns Observable<Professor> - Retorna um Observable com os dados do professor.
 */
  buscarProfessorPorId(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Atualizar os dados de um professor
 * 
 * Este método realiza uma requisição PUT para atualizar os dados de um professor específico, identificado pelo seu **ID**.
 * 
 * @param id - ID do professor a ser atualizado.
 * @param professor - Dados atualizados do professor.
 * @returns Observable<Professor> - Retorna um Observable com os dados do professor atualizado.
 */
  atualizarProfessor(id: number, professor: Professor): Observable<Professor> {
    return this.http.put<Professor>(`${this.baseUrl}/${id}`, professor).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Excluir um professor
 * 
 * Este método realiza uma requisição DELETE para excluir um professor do sistema, identificado pelo seu **ID**.
 * 
 * @param id - ID do professor a ser excluído.
 * @returns Observable<void> - Retorna um Observable vazio indicando que a operação foi concluída.
 */
  excluirProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );;
  }
}
