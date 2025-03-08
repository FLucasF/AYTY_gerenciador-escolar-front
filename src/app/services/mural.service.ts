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

  constructor(private http: HttpClient) {}

  /**
   * 📌 Listar postagens do mural de uma turma
   * @param turmaId - ID da turma
   * @param pageable - Parâmetros de paginação
   * @returns Observable<Page<Mural>>
   */
  listarPostagens(turmaId: number, pageable: any): Observable<Page<Mural>> {
    const params = new HttpParams({ fromObject: pageable });
    return this.http.get<Page<Mural>>(`${this.baseUrl}/turma/${turmaId}`, { params });
  }

  criarPostagem(formData: FormData): Observable<Mural> {
    return this.http.post<Mural>(this.baseUrl, formData);
  }

  /**
   * 📌 Buscar uma postagem por ID
   * @param id - ID da postagem
   * @returns Observable<Mural>
   */
  buscarPostagemPorId(id: number): Observable<Mural> {
    return this.http.get<Mural>(`${this.baseUrl}/${id}`);
  }

  /**
   * 📌 Excluir uma postagem do mural
   * @param id - ID da postagem
   * @returns Observable<void>
   */
  excluirPostagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
