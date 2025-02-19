import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mural } from '../../models/mural.model';

@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private apiUrl = 'http://localhost:8090/mural';

  constructor(private http: HttpClient) {}

  listarPostagens(turmaId: number): Observable<Mural[]> {
    return this.http.get<Mural[]>(`${this.apiUrl}/turma/${turmaId}`);
  }

  criarPostagem(mural: Mural): Observable<Mural> {
    return this.http.post<Mural>(this.apiUrl, mural);
  }

  excluirPostagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
