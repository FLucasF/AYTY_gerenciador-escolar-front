import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.aluno}`;

  constructor(private http: HttpClient) { }


  private handleError(error: HttpErrorResponse): Observable<never> {
      if (error.status === 400) {
        Swal.fire({
          icon: 'warning',
          title: 'Erros nos dados',
          text: 'Veja se você enviou corretamente',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Entendi'
        });
      } else if (error.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Aluno não encontrado!',
          text: 'O aluno que você está tentando acessar não existe.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      } else if (error.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Conflito de Dados!',
          text: error.error.message || 'Já existe um aluno cadastrado com esses dados.',
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
  * Cadastrar um novo aluno.
  * 
  * Este método envia uma requisição POST para criar um novo aluno no sistema, com os dados fornecidos.
  * 
  * @param aluno - Objeto contendo as informações do aluno a ser cadastrado.
  * @returns Observable<Aluno> - Retorna um Observable contendo o objeto `Aluno` que foi criado.
  */
  cadastrarAluno(aluno: Aluno): Observable<Aluno> {
    return this.http.post<Aluno>(this.baseUrl, aluno).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar todos os alunos com paginação.
   * 
   * Este método realiza uma requisição GET para obter todos os alunos cadastrados, com a possibilidade de aplicar paginação.
   * 
   * @param pageable - Objeto contendo os parâmetros de paginação (ex: `page`, `size`, `sort`).
   * @returns Observable<Page<Aluno>> - Retorna um Observable contendo uma página de objetos `Aluno`.
   */
  listarAlunos(pageable: any): Observable<Page<Aluno>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Aluno>>(`${this.baseUrl}`, { params }).pipe(
      catchError(this.handleError)
    );
  }
  /**
   * Buscar um aluno por ID.
   * 
   * Este método realiza uma requisição GET para recuperar um aluno específico pelo seu ID.
   * 
   * @param id - ID do aluno a ser buscado.
   * @returns Observable<Aluno> - Retorna um Observable contendo o objeto `Aluno` encontrado.
   */
  buscarAlunoPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
  /**
   * Atualizar as informações de um aluno.
   * 
   * Este método realiza uma requisição PUT para atualizar as informações de um aluno no sistema.
   * 
   * @param id - ID do aluno que será atualizado.
   * @param aluno - Objeto contendo as novas informações do aluno.
   * @returns Observable<Aluno> - Retorna um Observable contendo o objeto `Aluno` atualizado.
   */
  atualizarAluno(id: number, aluno: Aluno): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.baseUrl}/${id}`, aluno).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Excluir um aluno.
   * 
   * Este método realiza uma requisição DELETE para excluir um aluno com o ID especificado.
   * 
   * @param id - ID do aluno a ser excluído.
   * @returns Observable<void> - Retorna um Observable que completa a operação, sem retornar dados.
   */
  excluirAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
