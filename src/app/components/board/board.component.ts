import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MuralService } from '../../services/mural.service';
import { TurmaService } from '../../services/turma.service';
import { ProfessorService } from '../../services/professor.service';

import { Turma } from '../../models/turma.model';
import { Mural } from '../../models/mural.model';
import { Aluno } from '../../models/aluno.model';
import { Professor } from '../../models/professor.model';
import { Page } from '../../models/page.model';
import { PageEvent } from '@angular/material/paginator';


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
  isProfessor: boolean = false;
  isAluno: boolean = false;
  professoresMap = new Map<number, string>();
  turmaSelecionada?: Turma;
  postagens: Mural[] = [];
  novaPostagem: Mural = { titulo: '', conteudo: '' };
  alunosMatriculados: Aluno[] = [];

  totalAlunos: number = 0;
  sizeAlunos: number = 5;
  currentPageAlunos: number = 0;

  totalPostagens: number = 0;
  sizePostagens: number = 3;
  currentPagePostagens: number = 0;

  paginaTurmas: Page<Turma> | null = null;
  currentPage: number = 0;
  totalPages: number = 0;
  size: number = 7;
  totalElements: number = 0;
  turmas: Turma[] = [];

  constructor(
    private router: Router,
    private muralService: MuralService,
    private turmaService: TurmaService,
    private professorService: ProfessorService,
  ) {
    this.userName = localStorage.getItem('userName') || 'Usuário';
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.userRole = localStorage.getItem('role') || '';
  }

  ngOnInit(): void {
    this.carregarDadosDoUsuario();
    this.carregarTurmas();
    this.carregarProfessores();
    this.isProfessor = this.userRole === 'ROLE_PROFESSOR';
    this.isAluno = this.userRole === 'ROLE_ALUNO';
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

  mudarPaginaPostagens(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} no mural`);

    this.currentPagePostagens = event.pageIndex;
    this.sizePostagens = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarPostagens();
    }
  }

  mudarPaginaAlunos(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} dos alunos`);

    this.currentPageAlunos = event.pageIndex;
    this.sizeAlunos = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarAlunos(this.turmaSelecionada.id);
    }
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
      console.log('Nova postagem:', muralRequest);

      this.muralService.criarPostagem(muralRequest).subscribe({
        next: (res) => {
          this.postagens.unshift(res);
          this.novaPostagem = { titulo: '', conteudo: '' };
          console.log('Postagem criada:', res);
        },
        error: (err) => console.error('Erro ao criar postagem:', err)
      });
    }
  }

  excluirPostagem(id: number): void {
    if (!this.turmaSelecionada?.id) {
      console.error("Nenhuma turma selecionada para excluir postagens.");
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta postagem?')) {
      this.muralService.excluirPostagem(id).subscribe({
        next: () => {
          console.log(`Postagem ${id} excluída.`);

          this.carregarPostagens();
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


  private carregarDadosDoUsuario(): void {
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userId = Number(localStorage.getItem('userId'));
    const userRole = localStorage.getItem('role') || '';

    if (userId === 0 || !userRole) {
      console.error('Erro: Usuário não encontrado ou sem ID');
      return;
    }

    this.usuario = { id: userId, nome: userName, role: userRole };
  }


  private carregarTurmas(event?: PageEvent): void {
    if (!this.usuario || !this.usuario.id) {
      console.error('Erro: Usuário não encontrado ou sem ID');
      return;
    }

    const userId = this.usuario.id;

    if (event) {
      this.currentPage = event.pageIndex;
      this.size = event.pageSize;
    }

    console.log(`👤 Buscando turmas do usuário ID: ${userId} | Página: ${this.currentPage}, Tamanho: ${this.size}`);

    const pageable = { page: this.currentPage, size: this.size };

    if (this.usuario.role === 'ROLE_ADMIN') {
      this.turmaService.listarTodasTurmas(pageable).subscribe({
        next: (res: Page<Turma>) => {
          console.log("Dados recebidos do backend:", res);

          this.paginaTurmas = res;
          this.turmas = this.filtrarTurmas(res.content);

          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
          this.totalPages = res.page.totalPages;

          console.log(`Turmas carregadas para ADMIN - Página ${this.currentPage + 1} de ${this.totalPages}`);
        },
        error: (err) => console.error('Erro ao carregar turmas para ADMIN:', err)
      });
    } else if (this.usuario.role === 'ROLE_PROFESSOR') {
      this.turmaService.listarTurmasPorProfessor(userId, pageable).subscribe({
        next: (res: Page<Turma>) => {
          console.log("Dados recebidos do backend:", res);

          this.paginaTurmas = res;
          this.turmas = this.filtrarTurmas(res.content);

          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
          this.totalPages = res.page.totalPages;

          console.log(`Turmas carregadas para PROFESSOR - Página ${this.currentPage + 1} de ${this.totalPages}`);
        },
        error: (err) => console.error('Erro ao carregar turmas para PROFESSOR:', err)
      });
    } else if (this.usuario.role === 'ROLE_ALUNO') {
      this.turmaService.listarTurmasPorAluno(userId, pageable).subscribe({
        next: (res: Page<Turma>) => {
          console.log("Dados recebidos do backend:", res);

          this.paginaTurmas = res;
          this.turmas = res.content;

          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
          this.totalPages = res.page.totalPages;

          console.log(`Turmas carregadas para o ALUNO - Página ${this.currentPage + 1} de ${this.totalPages}`);
        },
        error: (err) => console.error('Erro ao carregar turmas para ALUNO:', err)
      });
    }
  }

  private carregarProfessores(): void {
    this.professorService.listarProfessores(0, 100).subscribe({
      next: (res) => {
        res.content.forEach((prof: Professor) => {
          if (prof.id) {
            this.professoresMap.set(prof.id, prof.nome);
          }
        });
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  mudarPagina(event: PageEvent): void {
    console.log(`Mudando para página: ${event.pageIndex}`);
    this.carregarTurmas(event);
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

  private carregarAlunos(turmaId: number): void {
    const pageable = { page: this.currentPageAlunos, size: this.sizeAlunos };

    this.turmaService.listarAlunosPorTurma(turmaId, pageable).subscribe({
      next: (res) => {
        this.alunosMatriculados = res.content || [];
        this.totalAlunos = res.page.totalElements;
        console.log('Alunos matriculados:', this.alunosMatriculados);
      },
      error: (err) => console.error('Erro ao carregar alunos da turma:', err)
    });
  }

  private carregarPostagens(turmaId?: number, event?: PageEvent): void {
    const id = turmaId ?? this.turmaSelecionada?.id;

    if (!id) {
      console.error("Nenhuma turma selecionada para carregar postagens.");
      return;
    }

    if (event) {
      this.currentPagePostagens = event.pageIndex;
      this.sizePostagens = event.pageSize;
    }

    const pageable = { page: this.currentPagePostagens, size: this.sizePostagens };

    this.muralService.listarPostagens(id, pageable).subscribe({
      next: (res: Page<Mural>) => {
        console.log("Postagens recebidas do backend:", res);

        this.postagens = res.content;
        this.currentPagePostagens = res.page.number;
        this.sizePostagens = res.page.size;
        this.totalPostagens = res.page.totalElements;
        this.totalPages = res.page.totalPages;
      },
      error: (err) => console.error('Erro ao carregar postagens:', err)
    });
  }



}
