import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Administrador } from '../models/administrador.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.administrador}`;

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
            title: 'Administrador não encontrado!',
            text: 'O Administrador que você está tentando acessar não existe.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        } else if (error.status === 409) {
          Swal.fire({
            icon: 'error',
            title: 'Conflito de Dados!',
            text: error.error.message || 'Já existe um administrador cadastrado com esses dados.',
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
   * Cadastrar um novo administrador.
   * 
   * Este método envia uma requisição POST para criar um novo administrador no sistema, com os dados fornecidos.
   * 
   * @param admin - Objeto contendo as informações do administrador a ser cadastrado.
   * @returns Observable<Administrador> - Retorna um Observable contendo o objeto `Administrador` que foi criado.
   */
  cadastrarAdministrador(admin: Administrador): Observable<Administrador> {
    return this.http.post<Administrador>(this.baseUrl, admin).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Listar todos os administradores com paginação.
   * 
   * Este método realiza uma requisição GET para obter todos os administradores cadastrados, com a possibilidade de aplicar paginação.
   * 
   * @param pageable - Objeto contendo os parâmetros de paginação (ex: `page`, `size`, `sort`).
   * @returns Observable<Page<Administrador>> - Retorna um Observable contendo uma página de objetos `Administrador`.
   */
  listarAdministradores(pageable: any): Observable<Page<Administrador>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Administrador>>(`${this.baseUrl}`, { params }).pipe(
      catchError(this.handleError)
    );
  }
  /**
   * Buscar um administrador por ID.
   * 
   * Este método realiza uma requisição GET para recuperar um administrador específico pelo seu ID.
   * 
   * @param id - ID do administrador a ser buscado.
   * @returns Observable<Administrador> - Retorna um Observable contendo o objeto `Administrador` encontrado.
   */
  buscarAdministradorPorId(id: number): Observable<Administrador> {
    return this.http.get<Administrador>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualizar as informações de um administrador.
   * 
   * Este método realiza uma requisição PUT para atualizar as informações de um administrador no sistema.
   * 
   * @param id - ID do administrador que será atualizado.
   * @param admin - Objeto contendo as novas informações do administrador.
   * @returns Observable<Administrador> - Retorna um Observable contendo o objeto `Administrador` atualizado.
   */


  atualizarAdministrador(id: number, admin: Administrador): Observable<Administrador> {
    return this.http.put<Administrador>(`${this.baseUrl}/${id}`, admin).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Excluir um administrador.
   * 
   * Este método realiza uma requisição DELETE para excluir um administrador com o ID especificado.
   * 
   * @param id - ID do administrador a ser excluído.
   * @returns Observable<void> - Retorna um Observable que completa a operação, sem retornar dados.
   */
  excluirAdministrador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
