import { Component, OnInit } from '@angular/core';
import { MuralService } from '../../services/mural/mural.service';
import { Mural } from '../../models/mural.model';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  postagens: Mural[] = [];
  novaPostagem: Mural = { titulo: '', conteudo: '' };
  turmaId: number = 1; // Defina a turma que deseja visualizar

  constructor(private muralService: MuralService) {}

  ngOnInit(): void {
    this.carregarPostagens();
  }

  carregarPostagens(): void {
    this.muralService.listarPostagens(this.turmaId).subscribe({
      next: (res) => (this.postagens = res),
      error: (err) => console.error('Erro ao carregar postagens:', err)
    });
  }

  criarPostagem(): void {
    if (!this.novaPostagem.titulo || !this.novaPostagem.conteudo) {
      alert('Preencha todos os campos!');
      return;
    }

    this.novaPostagem.turmaId = this.turmaId;
    this.muralService.criarPostagem(this.novaPostagem).subscribe({
      next: (res) => {
        this.postagens.unshift(res); // Adiciona no início da lista
        this.novaPostagem = { titulo: '', conteudo: '' }; // Limpa os campos
      },
      error: (err) => console.error('Erro ao criar postagem:', err)
    });
  }

  excluirPostagem(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
      this.muralService.excluirPostagem(id).subscribe({
        next: () => {
          this.postagens = this.postagens.filter(post => post.id !== id);
        },
        error: (err) => console.error('Erro ao excluir postagem:', err)
      });
    }
  }
}
