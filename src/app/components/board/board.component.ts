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
import Swal from 'sweetalert2';


@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  usuario = { id: 0, nome: 'Usuário', role: '' };
  isProfessor = false;
  isAluno = false;

  professoresMap = new Map<number, string>();
  turmaSelecionada?: Turma;
  postagens: Mural[] = [];
  novaPostagem: Mural = { titulo: '', conteudo: '' };
  alunosMatriculados: Aluno[] = [];

  totalAlunos = 0;
  sizeAlunos = 5;
  currentPageAlunos = 0;

  totalPostagens = 0;
  sizePostagens = 3;
  currentPagePostagens = 0;

  currentPage = 0;
  size = 7;
  totalElements = 0;

  turmas: Turma[] = [];

  constructor(
    private router: Router,
    private muralService: MuralService,
    private turmaService: TurmaService,
    private professorService: ProfessorService
  ) {
    const userId = Number(localStorage.getItem('userId')) || 0;
    const userName = localStorage.getItem('userName') || 'Usuário';
    const userRole = localStorage.getItem('role') || '';

    this.usuario = { id: userId, nome: userName, role: userRole };
    this.isProfessor = userRole === 'ROLE_PROFESSOR';
    this.isAluno = userRole === 'ROLE_ALUNO';
  }


  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarProfessores();
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


  mudarPagina(event: PageEvent): void {
    console.log(`Mudando para página: ${event.pageIndex}`);

    this.currentPage = event.pageIndex;
    this.size = event.pageSize;

    this.carregarTurmas();
  }


  mudarPaginaAlunos(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} dos alunos`);

    this.currentPageAlunos = event.pageIndex;
    this.sizeAlunos = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarAlunos(this.turmaSelecionada.id);
    }
  }


  mudarPaginaPostagens(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} no mural`);

    this.currentPagePostagens = event.pageIndex;
    this.sizePostagens = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarPostagens(this.turmaSelecionada.id);
    }
  }




  criarPostagem(): void {
    if (!this.novaPostagem.titulo || !this.novaPostagem.conteudo) {
      Swal.fire('Atenção!', 'Preencha todos os campos antes de publicar!', 'warning');
      return;
    }

    if (this.turmaSelecionada?.id) {
      const muralRequest = {
        titulo: this.novaPostagem.titulo,
        conteudo: this.novaPostagem.conteudo,
        turmaId: this.turmaSelecionada.id,
        professorId: this.usuario.id
      };

      this.muralService.criarPostagem(muralRequest).subscribe({
        next: (res) => {
          this.postagens.unshift(res);
          this.novaPostagem = { titulo: '', conteudo: '' };

          Swal.fire({
            title: 'Postagem criada!',
            text: 'Sua postagem foi publicada com sucesso.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          console.log('Postagem criada:', res);
        },
        error: (err) => {
          console.error('Erro ao criar postagem:', err);
          Swal.fire('Erro!', 'Não foi possível criar a postagem.', 'error');
        }
      });
    }
  }


  excluirPostagem(id: number): void {
    if (!this.turmaSelecionada?.id) {
      console.error("Nenhuma turma selecionada para excluir postagens.");
      return;
    }

    Swal.fire({
      title: 'Tem certeza?',
      text: "Essa ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.muralService.excluirPostagem(id).subscribe({
          next: () => {
            Swal.fire('Excluído!', 'A postagem foi removida.', 'success');
            this.carregarPostagens();
          },
          error: (err) => {
            console.error('Erro ao excluir postagem:', err);
            Swal.fire('Erro!', 'Não foi possível excluir a postagem.', 'error');
          }
        });
      }
    });
  }



  voltarParaTurmas(): void {
    this.turmaSelecionada = undefined;
    this.postagens = [];
    this.novaPostagem = { titulo: '', conteudo: '' };
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

  private carregarTurmas(): void {
    const pageable = { page: this.currentPage, size: this.size };

    if (this.usuario.role === 'ROLE_ADMIN') {
      this.turmaService.listarTodasTurmas(pageable).subscribe({
        next: (res) => {
          console.log("Turmas recebidas:", res);

          this.turmas = res.content;
          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
        },
        error: (err) => console.error('Erro ao carregar turmas:', err)
      });
    } else if (this.usuario.role === 'ROLE_PROFESSOR') {
      this.turmaService.listarTurmasPorProfessor(this.usuario.id, pageable).subscribe({
        next: (res) => {
          console.log("Turmas do professor recebidas:", res);

          this.turmas = res.content;
          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
        },
        error: (err) => console.error('Erro ao carregar turmas do professor:', err)
      });
    } else if (this.usuario.role === 'ROLE_ALUNO') {
      this.turmaService.listarTurmasPorAluno(this.usuario.id, pageable).subscribe({
        next: (res) => {
          console.log("Turmas do aluno recebidas:", res);

          this.turmas = res.content;
          this.currentPage = res.page.number;
          this.size = res.page.size;
          this.totalElements = res.page.totalElements;
        },
        error: (err) => console.error('Erro ao carregar turmas do aluno:', err)
      });
    }
  }

  private carregarProfessores(): void {
    const pageable = { page: this.currentPage, size: this.size };

    this.professorService.listarProfessores(pageable).subscribe({
      next: (res) => {
        console.log("Professores recebidos:", res);

        this.professoresMap.clear(); // Limpa o mapa antes de atualizar
        res.content.forEach(prof => {
          if (prof.id) {
            this.professoresMap.set(prof.id, prof.nome);
          }
        });

        // Atualiza os valores de paginação corretamente
        this.currentPage = res.page.number;
        this.size = res.page.size;
        this.totalElements = res.page.totalElements;
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  private carregarAlunos(turmaId: number): void {
    const pageable = { page: this.currentPageAlunos, size: this.sizeAlunos };

    this.turmaService.listarAlunosPorTurma(turmaId, pageable).subscribe({
      next: (res) => {
        console.log("Alunos recebidos:", res);

        this.alunosMatriculados = res.content || [];
        this.totalAlunos = res.page.totalElements;
        this.currentPageAlunos = res.page.number;
        this.sizeAlunos = res.page.size;
      },
      error: (err) => console.error('Erro ao carregar alunos:', err)
    });
  }

  private carregarPostagens(turmaId?: number): void {
    const id = turmaId ?? this.turmaSelecionada?.id;
    if (!id) return;

    const pageable = { page: this.currentPagePostagens, size: this.sizePostagens };

    this.muralService.listarPostagens(id, pageable).subscribe({
      next: (res) => {
        console.log("Postagens recebidas:", res);

        this.postagens = res.content;
        this.currentPagePostagens = res.page.number;
        this.sizePostagens = res.page.size;
        this.totalPostagens = res.page.totalElements;
      },
      error: (err) => console.error('Erro ao carregar postagens:', err)
    });
  }
}
