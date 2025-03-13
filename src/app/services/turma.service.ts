import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Turma } from '../models/turma.model';
import { Aluno } from '../models/aluno.model';
import { Page } from '../models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurmaService {
  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.turma}`;

  constructor(private http: HttpClient) { }

  /**
 * Listar os alunos de uma turma
 * 
 * Este método realiza uma requisição GET para listar os alunos de uma turma específica.
 * Ele recebe os parâmetros de **paginamento** e retorna uma **página de alunos** matriculados nessa turma.
 * 
 * @param turmaId - ID da turma para a qual os alunos serão listados.
 * @param pageable - Parâmetros de paginação, como número de página e tamanho da página.
 * @returns Observable<Page<Aluno>> - Retorna um Observable contendo uma página de alunos.
 */
  listarAlunosPorTurma(turmaId: number, pageable: any): Observable<Page<Aluno>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Aluno>>(`${this.baseUrl}/${turmaId}/alunos`, { params });
  }

  /**
 * Listar turmas atribuídas a um professor
 * 
 * Este método realiza uma requisição GET para listar as turmas associadas a um professor específico.
 * 
 * @param professorId - ID do professor para o qual as turmas serão listadas.
 * @param pageable - Parâmetros de paginação, como número de página e tamanho da página.
 * @returns Observable<Page<Turma>> - Retorna um Observable contendo uma página de turmas.
 */
  listarTurmasPorProfessor(professorId: number, pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/professor/${professorId}`, { params });
  }

  /**
 * Listar turmas em que um aluno está matriculado
 * 
 * Este método realiza uma requisição GET para listar as turmas em que um aluno específico está matriculado.
 * 
 * @param alunoId - ID do aluno para o qual as turmas serão listadas.
 * @param pageable - Parâmetros de paginação, como número de página e tamanho da página.
 * @returns Observable<Page<Turma>> - Retorna um Observable contendo uma página de turmas.
 */
  listarTurmasPorAluno(alunoId: number, pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/aluno/${alunoId}`, { params });
  }

  /**
 * Buscar uma turma pelo ID
 * 
 * Este método realiza uma requisição GET para buscar os detalhes de uma turma específica a partir de seu **ID**.
 * 
 * @param id - ID da turma a ser buscada.
 * @returns Observable<Turma> - Retorna um Observable contendo os detalhes da turma.
 */
  buscarTurmaPorId(id: number): Observable<Turma> {
    return this.http.get<Turma>(`${this.baseUrl}/${id}`);
  }

  /**
 * Listar todas as turmas com paginação
 * 
 * Este método realiza uma requisição GET para listar todas as turmas cadastradas no sistema. Ele aceita parâmetros de **paginamento**.
 * 
 * @param pageable - Parâmetros de paginação, como número de página e tamanho da página.
 * @returns Observable<Page<Turma>> - Retorna um Observable contendo uma página de turmas.
 */
  listarTodasTurmas(pageable: any): Observable<Page<Turma>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Turma>>(`${this.baseUrl}/geral`, { params });
  }

  /**
 * Adicionar uma nova turma
 * 
 * Este método realiza uma requisição POST para criar uma nova turma no sistema, enviando os dados de uma turma.
 * 
 * @param turma - Dados da turma a ser criada.
 * @returns Observable<Turma> - Retorna um Observable contendo os dados da turma criada.
 */
  adicionarTurma(turma: Partial<Turma>): Observable<Turma> {
    return this.http.post<Turma>(this.baseUrl, turma);
  }

  /**
 * Atualizar os dados de uma turma
 * 
 * Este método realiza uma requisição PUT para atualizar os dados de uma turma específica, identificada pelo seu **ID**.
 * 
 * @param id - ID da turma a ser atualizada.
 * @param turma - Dados atualizados da turma.
 * @returns Observable<Turma> - Retorna um Observable com os dados da turma atualizada.
 */
  atualizarTurma(id: number, turma: Partial<Turma>): Observable<Turma> {
    return this.http.put<Turma>(`${this.baseUrl}/${id}`, turma);
  }

  /**
 * Excluir uma turma
 * 
 * Este método realiza uma requisição DELETE para excluir uma turma do sistema, identificada pelo seu **ID**.
 * 
 * @param id - ID da turma a ser excluída.
 * @returns Observable<void> - Retorna um Observable vazio.
 */
  excluirTurma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
 * Matricular um aluno em uma turma
 * 
 * Este método realiza uma requisição POST para matricular um aluno em uma turma específica.
 * 
 * @param turmaId - ID da turma na qual o aluno será matriculado.
 * @param alunoId - ID do aluno a ser matriculado.
 * @returns Observable<Turma> - Retorna um Observable com os dados da turma atualizada.
 */
  matricularAluno(turmaId: number, alunoId: number): Observable<Turma> {
    return this.http.post<Turma>(`${this.baseUrl}/${turmaId}/matricular/${alunoId}`, {});
  }

  /**
 * Remover um aluno de uma turma
 * 
 * Este método realiza uma requisição DELETE para remover um aluno de uma turma específica.
 * 
 * @param turmaId - ID da turma da qual o aluno será removido.
 * @param alunoId - ID do aluno a ser removido.
 * @returns Observable<Page<Aluno>> - Retorna uma página de alunos restantes após a remoção.
 */
  removerAlunoDaTurma(turmaId: number, alunoId: number): Observable<Page<Aluno>> {
    return this.http.delete<Page<Aluno>>(`${this.baseUrl}/${turmaId}/remover/${alunoId}`);
  }
}
