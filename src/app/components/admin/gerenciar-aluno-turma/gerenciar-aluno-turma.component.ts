import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../services/turma.service';
import { AlunoService } from '../../../services/aluno.service';
import { Page } from '../../../models/page.model';
import { Aluno } from '../../../models/aluno.model';
import { Turma } from '../../../models/turma.model';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gerenciar-aluno-turma',
  standalone: false,
  templateUrl: './gerenciar-aluno-turma.component.html',
  styleUrls: ['./gerenciar-aluno-turma.component.css']
})
export class GerenciarAlunoTurmaComponent implements OnInit {
  turmaId: number | null = null;
  turmaNome: string = '';
  paginaAlunos: Page<Aluno> | null = null;
  todosAlunos: Aluno[] = [];
  alunosDisponiveis: Aluno[] = [];
  loadingAlunos = true;

  // Paginação para alunos matriculados (obtida do backend)
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  // Paginação para alunos disponíveis (paginação local)
  availablePageIndex: number = 0;
  availablePageSize: number = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turmaService: TurmaService,
    private alunoService: AlunoService
  ) { }


  /**
   * Método de inicialização do componente.
   * Carrega os dados da turma e os alunos vinculados à turma selecionada.
   */
  ngOnInit(): void {
    console.log('Iniciado!');
    this.route.params.subscribe(params => {
      this.turmaId = +params['id'];

      if (!this.turmaId || isNaN(this.turmaId)) {
        console.warn('[GerenciarAlunoTurmaComponent] ID da turma inválido, retornando...');
        this.router.navigate(['/admin/turmas']);
        return;
      }

      this.carregarTurma();
      this.carregarAlunosDaTurma();
      this.carregarTodosAlunos();
    });
  }

  /**
   * Carrega todos os alunos cadastrados.
   * 
   * Carrega a lista completa de alunos, incluindo os matriculados e os disponíveis para a turma.
   */
  private carregarTodosAlunos(): void {
    this.loadingAlunos = true;
    // Carrega todos os alunos (ajuste os parâmetros conforme sua API)
    this.alunoService.listarAlunos({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        this.todosAlunos = res.content;
        this.loadingAlunos = false;
        console.log('[GerenciarAlunoTurmaComponent] Todos os alunos carregados.');
        // Atualiza alunos disponíveis sempre que todosAlunos é carregado
        this.atualizarAlunosDisponiveis();
      },
      error: (err) => {
        console.error('Erro ao carregar todos os alunos:', err);
        this.loadingAlunos = false;
      }
    });
  }


   /**
   * Carrega os dados da turma (nome da turma).
   * 
   * Utiliza o serviço `TurmaService` para buscar a turma com base no ID obtido.
   */
  private carregarTurma(): void {
    if (!this.turmaId) return;

    this.turmaService.buscarTurmaPorId(this.turmaId).subscribe({
      next: (turma: Turma) => {
        this.turmaNome = turma.nome;
        console.log(`Turma carregada: ${turma.nome}`);
      },
      error: (err) => console.error('Erro ao carregar turma:', err)
    });
  }

   /**
   * Carrega os alunos matriculados na turma.
   * 
   * @param event - Parâmetros de paginação, se a mudança de página ocorrer.
   */
  carregarAlunosDaTurma(event?: PageEvent): void {
    if (!this.turmaId) return;

    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    this.turmaService.listarAlunosPorTurma(this.turmaId, { page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (res) => {
        this.paginaAlunos = res;
        this.pageIndex = res.page.number;
        this.pageSize = res.page.size;
        this.totalElements = res.page.totalElements;
        console.log(`[GerenciarAlunoTurmaComponent] Alunos matriculados carregados para a turma ${this.turmaId}`);

        // Atualiza a lista de alunos disponíveis após carregar os matriculados
        this.atualizarAlunosDisponiveis();
      },
      error: (err) => console.error('Erro ao carregar alunos matriculados:', err)
    });
  }

  
 /**
   * Atualiza a lista de alunos disponíveis para adicionar à turma.
   * 
   * Filtra os alunos não matriculados a partir da lista de todos os alunos.
   */
  private atualizarAlunosDisponiveis(): void {
    if (!this.paginaAlunos) {
      console.error('Lista de alunos matriculados não carregada ainda.');
      return;
    }
    const matriculadosIds = this.paginaAlunos.content.map((aluno: Aluno) => aluno.id);
    this.alunosDisponiveis = this.todosAlunos.filter(aluno => !matriculadosIds.includes(aluno.id));
    // Reinicia a paginação local dos disponíveis
    this.availablePageIndex = 0;
  }

  /**
   * Retorna a lista de alunos disponíveis paginada.
   * 
   * @returns Lista de alunos disponíveis para exibição, conforme a paginação local.
   */
  get availableAlunosPaginated(): Aluno[] {
    const start = this.availablePageIndex * this.availablePageSize;
    const end = start + this.availablePageSize;
    return this.alunosDisponiveis.slice(start, end);
  }

  /**
   * Manipula a mudança de página para os alunos disponíveis.
   * 
   * @param event - Evento de mudança de página, contendo a nova página e tamanho da página.
   */
  onAvailablePageChange(event: PageEvent): void {
    this.availablePageIndex = event.pageIndex;
    this.availablePageSize = event.pageSize;
  }

   /**
   * Adiciona um aluno à turma.
   * 
   * @param alunoId - ID do aluno a ser adicionado à turma.
   */
  adicionarAlunoNaTurma(alunoId: number): void {
    if (!this.turmaId || !alunoId) return;

    this.turmaService.matricularAluno(this.turmaId, alunoId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Aluno matriculado na turma!',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        console.log(`[GerenciarAlunoTurmaComponent] Aluno ${alunoId} matriculado!`);
        this.carregarAlunosDaTurma();
        this.carregarTodosAlunos();
      },
      error: (err) => {
        console.error('Erro ao adicionar aluno:', err);
        Swal.fire('Erro!', 'Não foi possível adicionar o aluno. Tente novamente.', 'error');
      }
    });
  }

   /**
   * Remove um aluno da turma.
   * 
   * @param alunoId - ID do aluno a ser removido da turma.
   */
  removerAlunoDaTurma(alunoId: number): void {
    if (!this.turmaId) {
      console.error("Erro: ID da turma é nulo.");
      return;
    }

    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você realmente deseja remover este aluno da turma?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.turmaService.removerAlunoDaTurma(this.turmaId!, alunoId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Removido!',
              text: 'O aluno foi removido da turma com sucesso.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            });
            console.log(`[GerenciarAlunoTurmaComponent] Aluno ${alunoId} removido da turma ${this.turmaId}`);
            this.carregarAlunosDaTurma();
          },
          error: (err) => {
            Swal.fire({
              title: 'Erro!',
              text: 'Não foi possível remover o aluno. Tente novamente.',
              icon: 'error',
              confirmButtonColor: '#d33',
              confirmButtonText: 'Fechar'
            });
            console.error('Erro ao remover aluno:', err);
          }
        });
      }
    });
  }


 /**
   * Volta para a tela de turmas, com confirmação de perda de alterações não salvas.
   */
  voltarParaTurmas(): void {
    Swal.fire({
      title: 'Deseja sair?',
      text: 'Você perderá as alterações não salvas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, voltar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('[GerenciarAlunoTurmaComponent] Retornando para lista de turmas.');
        this.router.navigate(['/admin/turmas']);
      }
    });
  }
}
