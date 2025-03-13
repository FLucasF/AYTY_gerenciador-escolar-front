import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mural } from '../models/mural.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private baseUrl = `${environment.apiBaseUrl}/api/murais`;

  constructor(private http: HttpClient) { }

  /**
 * Listar postagens do mural de uma turma
 * 
 * Este método realiza uma requisição GET para obter todas as postagens do mural de uma turma específica.
 * Ele utiliza parâmetros de paginação para controlar o número de postagens retornadas por vez.
 * 
 * @param turmaId - ID da turma para a qual as postagens são solicitadas.
 * @param pageable - Objeto contendo os parâmetros de paginação (ex: `page`, `size`, `sort`).
 * @returns Observable<Page<Mural>> - Retorna um Observable contendo uma página de objetos do tipo `Mural`.
 */
  listarPostagens(turmaId: number, pageable: any): Observable<Page<Mural>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Mural>>(`${this.baseUrl}/turma/${turmaId}`, { params });
  }


  /**
   * Criar uma nova postagem no mural
   * 
   * Este método envia uma requisição POST para criar uma nova postagem no mural de uma turma. 
   * Os dados são enviados no formato **FormData**, permitindo o envio de arquivos (como imagens) juntamente com os dados do formulário.
   * 
   * @param formData - Dados da nova postagem a serem enviados, incluindo arquivos de mídia, caso necessário.
   * @returns Observable<Mural> - Retorna um Observable que emite o objeto da postagem criada.
   */
  criarPostagem(formData: FormData): Observable<Mural> {
    return this.http.post<Mural>(this.baseUrl, formData);
  }


  /**
   * Buscar uma postagem por ID
   * 
   * Este método realiza uma requisição GET para recuperar uma postagem específica usando seu **ID**.
   * O método retorna os detalhes completos da postagem.
   * 
   * @param id - ID da postagem a ser buscada.
   * @returns Observable<Mural> - Retorna um Observable que emite o objeto da postagem solicitada.
   */
  buscarPostagemPorId(id: number): Observable<Mural> {
    return this.http.get<Mural>(`${this.baseUrl}/${id}`);
  }


  /**
   * Excluir uma postagem do mural
   * 
   * Este método envia uma requisição DELETE para excluir uma postagem do mural com o **ID** especificado.
   * A exclusão é feita no lado do servidor e a operação é lógica, removendo a postagem do mural.
   * 
   * @param id - ID da postagem a ser excluída.
   * @returns Observable<void> - Retorna um Observable que completa a operação, sem retornar dados.
   */
  excluirPostagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
