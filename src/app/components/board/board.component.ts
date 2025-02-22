import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuralService } from '../../services/mural.service';
import { TurmaService } from '../../services/turma.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Turma } from '../../models/turma.model';
import { Mural } from '../../models/mural.model';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  userName: string;
  userId: number;
  userRole: string;
  isProfessor: boolean;
  professoresMap = new Map<number, string>();
  turmas: Turma[] = [];
  turmaSelecionada?: Turma;
  postagens: Mural[] = [];
  novaPostagem: Mural = { titulo: '', conteudo: '' }; // Nunca undefined

  constructor(
    private router: Router,
    private muralService: MuralService,
    private turmaService: TurmaService,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {
    // O usuário deve ter sido autenticado e os dados armazenados no localStorage
    this.userName = localStorage.getItem('userName') || 'Usuário';
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.userRole = localStorage.getItem('role') || '';
    this.isProfessor = this.userRole === 'ROLE_PROFESSOR';
  }

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarProfessores();
  }

  private carregarTurmas(): void {
    this.turmaService.listarTurmas().subscribe({
      next: (res) => {
        // Filtra as turmas de acordo com a role:
        // - Administrador: todas as turmas.
        // - Professor: turmas onde turma.professorId === userId.
        // - Aluno: turmas onde turma.alunos (array de números) contém userId.
        this.turmas = this.filtrarTurmas(res.content);
        console.log('✅ Turmas filtradas:', this.turmas);
      },
      error: (err) => console.error('Erro ao carregar turmas:', err)
    });
  }

  private filtrarTurmas(turmas: Turma[]): Turma[] {
    if (this.userRole === 'ROLE_ADMINISTRADOR') {
      return turmas;
    } else if (this.userRole === 'ROLE_PROFESSOR') {
      return turmas.filter(turma => turma.professorId === this.userId);
    } else if (this.userRole === 'ROLE_ALUNO') {
      return turmas.filter(turma => turma.alunos && turma.alunos.includes(this.userId));
    }
    return [];
  }

  private carregarProfessores(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) =>
        res.content
          .filter(user => user.role === 'ROLE_PROFESSOR')
          .forEach(({ id, nome }) => {
            if (id) {
              this.professoresMap.set(id, nome);
            }
          }),
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  selectTurma(turma: Turma): void {
    this.turmaSelecionada = turma;
    this.postagens = [];
    if (turma.id) {
      this.carregarPostagens(turma.id);
    }
  }

  private carregarPostagens(turmaId: number): void {
    this.muralService.listarPostagens(turmaId).subscribe({
      next: (res) => {
        this.postagens = res;
        console.log('✅ Postagens carregadas:', this.postagens);
      },
      error: (err) => console.error('Erro ao carregar postagens:', err)
    });
  }

  criarPostagem(): void {
    if (!this.novaPostagem.titulo || !this.novaPostagem.conteudo) {
      alert('Preencha todos os campos!');
      return;
    }
    if (this.turmaSelecionada?.id) {
      this.novaPostagem.turmaId = this.turmaSelecionada.id;
      this.muralService.criarPostagem(this.novaPostagem).subscribe({
        next: (res) => {
          this.postagens.unshift(res);
          this.novaPostagem = { titulo: '', conteudo: '' };
          console.log('✅ Postagem criada:', res);
        },
        error: (err) => console.error('Erro ao criar postagem:', err)
      });
    }
  }

  excluirPostagem(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
      this.muralService.excluirPostagem(id).subscribe({
        next: () => {
          this.postagens = this.postagens.filter(post => post.id !== id);
          console.log(`✅ Postagem ${id} excluída.`);
        },
        error: (err) => console.error('Erro ao excluir postagem:', err)
      });
    }
  }

  voltarParaTurmas(): void {
    this.turmaSelecionada = undefined;
    this.postagens = [];
    this.novaPostagem = { titulo: '', conteudo: '' };
  }

  goToPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}
