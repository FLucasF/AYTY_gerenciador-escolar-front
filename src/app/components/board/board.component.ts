import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuralService } from '../../services/mural.service';
import { TurmaService } from '../../services/turma.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Turma } from '../../models/turma.model';
import { Mural } from '../../models/mural.model';
import { Aluno } from '../../models/aluno.model';
import { ProfessorService } from '../../services/professor.service';
import { Professor } from '../../models/professor.model';

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
  novaPostagem: Mural = { titulo: '', conteudo: '' };
  alunosMatriculados: Aluno[] = [];

  constructor(
    private router: Router,
    private muralService: MuralService,
    private turmaService: TurmaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private professorService: ProfessorService
  ) {
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
    if (this.userRole === 'ROLE_ALUNO') {
      // Para alunos, chama a rota que retorna as turmas do usuário
      this.turmaService.listarTurmasDoUsuario(this.userId).subscribe({
        next: (res) => {
          this.turmas = res.content;
          console.log('✅ Turmas do usuário:', this.turmas);
        },
        error: (err) =>
          console.error('Erro ao carregar turmas do usuário:', err)
      });
    } else {
      // Para ADMINISTRADOR e PROFESSOR, você pode usar a rota de listar todas
      this.turmaService.listarTurmas().subscribe({
        next: (res) => {
          this.turmas = this.filtrarTurmas(res.content);
          console.log('✅ Turmas filtradas:', this.turmas);
        },
        error: (err) => console.error('Erro ao carregar turmas:', err)
      });
    }
  }

  private filtrarTurmas(turmas: Turma[]): Turma[] {
    if (this.userRole === 'ROLE_ADMINISTRADOR') {
      return turmas;
    } else if (this.userRole === 'ROLE_PROFESSOR') {
      return turmas.filter(turma => turma.professorId === this.userId);
    }
    return turmas;
  }

  private carregarProfessores(): void {
    this.professorService.listarProfessores(0, 100).subscribe({
      next: (res) => {
        console.log('🔎 Resposta completa de listarProfessores():', res);
        res.content.forEach((prof: Professor) => {
          console.log('Professor:', prof);
          if (prof.id) {
            this.professoresMap.set(prof.id, prof.nome);
          }
        });
        console.log('✅ Professores carregados no Map:', Array.from(this.professoresMap.entries()));
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  selectTurma(turma: Turma): void {
    this.turmaSelecionada = turma;
    this.postagens = [];
    this.alunosMatriculados = [];
    console.log('✏️ Turma selecionada:', turma);
    if (turma.id) {
      this.carregarPostagens(turma.id);
      this.carregarAlunos(turma.id);
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

  private carregarAlunos(turmaId: number): void {
    this.turmaService.listarAlunosPorTurma(turmaId).subscribe({
      next: (res) => {
        this.alunosMatriculados = res.content || [];
        console.log('✅ Alunos matriculados:', this.alunosMatriculados);
      },
      error: (err) => console.error('Erro ao carregar alunos da turma:', err)
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

  getProfessorNome(professorId?: number | null): string {
    console.log('🔍 getProfessorNome chamado com professorId:', professorId);
    if (!professorId) {
      console.log('🔍 professorId não definido. Retornando "Não atribuído"');
      return 'Não atribuído';
    }
    const professorNome = this.professoresMap.get(professorId) || 'Não atribuído';
    console.log('🔍 Nome encontrado para professorId', professorId, ':', professorNome);
    return professorNome;
  }
}
