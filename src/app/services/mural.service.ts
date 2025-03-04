import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mural } from '../models/mural.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private apiUrl = 'http://localhost:8090/mural';

  constructor(private http: HttpClient) {}

  listarPostagens(turmaId: number, pageable: any): Observable<Page<Mural>> {
    return this.http.get<Page<Mural>>(`${this.apiUrl}/turma/${turmaId}`, { params: pageable });
}

  //faltou update

  criarPostagem(mural: Mural): Observable<Mural> {
    return this.http.post<Mural>(this.apiUrl, mural);
  }

  excluirPostagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
