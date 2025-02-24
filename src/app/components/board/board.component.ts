import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuralService } from '../../services/mural.service';
import { TurmaService } from '../../services/turma.service';
import { ProfessorService } from '../../services/professor.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Turma } from '../../models/turma.model';
import { Mural } from '../../models/mural.model';
import { Aluno } from '../../models/aluno.model';
import { Professor } from '../../models/professor.model';
import { Pageable } from '../../models/pageable.model';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  usuario: { id: number; nome: string; role: string } = { id: 0, nome: 'Usuário', role: '' };
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
    private professorService: ProfessorService,
    private usuarioService: UsuarioService
  ) {
    this.userName = localStorage.getItem('userName') || 'Usuário';
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.userRole = localStorage.getItem('role') || '';
    this.isProfessor = this.userRole === 'ROLE_PROFESSOR';
  }

  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarTurmas();
    this.carregarProfessores();

    
  }

  private carregarDadosDoUsuario(): void {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userId = Number(localStorage.getItem('userId')); // Aqui garantimos que o userId seja convertido para número
    const userRole = localStorage.getItem('role') || '';
    
    // Verificando se os dados do usuário estão no localStorage
    console.log('🔍 Dados carregados do localStorage:', { userName, userId, userRole });
  
    // Verificando se o id e role são válidos
    if (userId === 0 || !userRole) {
      console.error('❌ Erro: Usuário não encontrado ou sem ID');
      return;
    }
  
    this.usuario = { id: userId, nome: userName, role: userRole }; // Atribui corretamente o usuario
    console.log('🔑 Usuario carregado:', this.usuario);
  }
  
  

  private carregarTurmas(): void {
    if (!this.usuario || !this.usuario.id) {
      console.error('❌ Erro: Usuário não encontrado ou sem ID');
      return;
    }

    const userId = this.usuario.id;

    console.log(`👤 Enviando requisição para buscar turmas do aluno com ID: ${userId}`);

    const pageable = { page: 0, size: 10 }; // Definindo o tamanho da página e página inicial

    if (this.usuario.role === 'ROLE_ADMIN') {
      this.turmaService.listarTodasTurmas(pageable).subscribe({
        next: (res) => {
          this.turmas = this.filtrarTurmas(res.content);
          console.log('✅ Turmas carregadas para ADMIN:', this.turmas);
        },
        error: (err) => console.error('Erro ao carregar turmas para ADMIN:', err)
      });
    } else if (this.usuario.role === 'ROLE_PROFESSOR') {
      this.turmaService.listarTurmasPorProfessor(userId, pageable).subscribe({
        next: (res) => {
          this.turmas = this.filtrarTurmas(res.content);
          console.log('✅ Turmas carregadas para PROFESSOR:', this.turmas);
        },
        error: (err) => console.error('Erro ao carregar turmas para PROFESSOR:', err)
      });
    } else if (this.usuario.role === 'ROLE_ALUNO') {
      this.turmaService.listarTurmasPorAluno(userId, pageable).subscribe({
        next: (res) => {
          console.log('✅ Turmas carregadas para o aluno:', res.content);  // Verifique a resposta do backend
          this.turmas = res.content;  // Armazenando as turmas no componente
        },
        error: (err) => {
          console.error('❌ Erro ao carregar turmas:', err);  // Tratando erro
        }
      });
    }
  }

  private filtrarTurmas(turmas: Turma[]): Turma[] {
    if (this.usuario.role === 'ROLE_ADMIN') {
      return turmas;
    } else if (this.usuario.role === 'ROLE_PROFESSOR') {
      return turmas.filter(turma => turma.professorId === this.usuario.id);
    } else if (this.usuario.role === 'ROLE_ALUNO') {
      return turmas.filter(turma => turma.alunos && turma.alunos.includes(this.usuario.id));
    }
    return [];
  }

  private carregarProfessores(): void {
    this.professorService.listarProfessores(0, 100).subscribe({
      next: (res) => {
        console.log('🔎 Resposta completa de listarProfessores():', res);
        res.content.forEach((prof: Professor) => {
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
    const pageable = { page: 0, size: 100 };
    this.turmaService.listarAlunosPorTurma(turmaId, pageable).subscribe({
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
      const muralRequest = {
        titulo: this.novaPostagem.titulo,
        conteudo: this.novaPostagem.conteudo,
        turmaId: this.turmaSelecionada.id,
        professorId: this.usuario.id // Certifique-se de que esse valor está definido
      };
      console.log('📝 Nova postagem:', muralRequest);

      this.muralService.criarPostagem(muralRequest).subscribe({
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
    if (!professorId) {
      return 'Não atribuído';
    }
    return this.professoresMap.get(professorId) || 'Não atribuído';
  }
}
