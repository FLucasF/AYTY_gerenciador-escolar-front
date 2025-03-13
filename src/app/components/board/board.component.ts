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
  postagemSelecionada: any = null;

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
  size = 5;
  totalElements = 0;

  novaImagem: File | null = null;
  turmas: Turma[] = [];

  constructor(
    // private router: Router,
    private muralService: MuralService,
    private turmaService: TurmaService,
    private professorService: ProfessorService
  ) {
    const userId = Number(sessionStorage.getItem('userId')) || 0;
    const userName = sessionStorage.getItem('userName') || 'Usuário';
    const userRole = sessionStorage.getItem('role') || '';

    console.log(`ID do usuário salvo no localStorage: ${userId}`);
    console.log(`Role do usuário salvo no localStorage: ${userRole}`);

    this.usuario = { id: userId, nome: userName, role: userRole };
    this.isProfessor = userRole === 'ROLE_PROFESSOR';
    this.isAluno = userRole === 'ROLE_ALUNO';
  }

 /**
   * Inicializa o componente.
   * Carrega as turmas e professores conforme o papel do usuário (admin, professor, aluno).
   */
  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarProfessores();
  }

/**
   * Seleciona uma turma e carrega as postagens e alunos dessa turma.
   * 
   * @param turma - Objeto contendo as informações da turma selecionada.
   */
  selectTurma(turma: Turma): void {
    this.turmaSelecionada = turma;
    this.postagens = [];
    this.alunosMatriculados = [];
    if (turma.id) {
      this.carregarPostagens(turma.id);
      this.carregarAlunos(turma.id);
    }
  }

/**
   * Muda a página de turmas.
   * 
   * @param event - Evento que contém informações sobre a página e tamanho da página.
   */
  mudarPagina(event: PageEvent): void {
    console.log(`Mudando para página: ${event.pageIndex}`);

    this.currentPage = event.pageIndex;
    this.size = event.pageSize;

    this.carregarTurmas();
  }

/**
   * Muda a página de alunos matriculados em uma turma.
   * 
   * @param event - Evento que contém informações sobre a página e tamanho da página.
   */
  mudarPaginaAlunos(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} dos alunos`);

    this.currentPageAlunos = event.pageIndex;
    this.sizeAlunos = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarAlunos(this.turmaSelecionada.id);
    }
  }

/**
   * Muda a página das postagens no mural.
   * 
   * @param event - Evento que contém informações sobre a página e tamanho da página.
   */
  mudarPaginaPostagens(event: PageEvent): void {
    console.log(`Mudando para página ${event.pageIndex} no mural`);

    this.currentPagePostagens = event.pageIndex;
    this.sizePostagens = event.pageSize;

    if (this.turmaSelecionada) {
      this.carregarPostagens(this.turmaSelecionada.id);
    }
  }

/**
   * Volta para a tela de turmas, limpando as postagens e a turma selecionada.
   */
  voltarParaTurmas(): void {
    this.turmaSelecionada = undefined;
    this.postagens = [];
    this.novaPostagem = { titulo: '', conteudo: '' };
  }

  /**
   * Retorna o nome do professor baseado no ID.
   * 
   * @param professorId - ID do professor.
   * @returns Nome do professor ou 'Não atribuído' caso não encontrado.
   */
  getProfessorNome(professorId?: number | null): string {
    if (!professorId) {
      return 'Não atribuído';
    }
    return this.professoresMap.get(professorId) || 'Não atribuído';
  }

 /**
   * Carrega as turmas baseadas no papel do usuário (ADMIN, PROFESSOR ou ALUNO).
   */
  private carregarTurmas(): void {
    const pageable = { page: this.currentPage, size: this.size };

    console.log(`Iniciando carregamento de turmas...`);
    console.log(`Usuário:`, this.usuario);
    console.log(`ID do usuário salvo no localStorage:`, localStorage.getItem('userId'));
    console.log(`Role do usuário salvo no localStorage:`, localStorage.getItem('role'));

    if (!this.usuario.id || this.usuario.id === 0) {
      console.error(`ERRO: O ID do usuário é inválido (0 ou indefinido)!`);
      return;
    }

    if (this.usuario.role === 'ROLE_ADMIN') {
      console.log(`O usuário é ADMIN, carregando todas as turmas`);
      this.turmaService.listarTodasTurmas(pageable).subscribe({
        next: (res) => {
          console.log("Turmas recebidas (ADMIN):", res);
          this.atualizarEstadoTurmas(res);
        },
        error: (err) => console.error('Erro ao carregar turmas (ADMIN):', err)
      });

    } else if (this.usuario.role === 'ROLE_PROFESSOR') {
      console.log(`O usuário é PROFESSOR, carregando turmas com ID: ${this.usuario.id}...`);

      if (!this.usuario.id || this.usuario.id === 0) {
        console.error(`ERRO: O ID do professor ainda está 0!`);
        return;
      }

      this.turmaService.listarTurmasPorProfessor(this.usuario.id, pageable).subscribe({
        next: (res) => {
          console.log("✅ Turmas do professor recebidas:", res);
          this.atualizarEstadoTurmas(res);
        },
        error: (err) => console.error('Erro ao carregar turmas do professor:', err)
      });

    } else if (this.usuario.role === 'ROLE_ALUNO') {
      console.log(`O usuário é ALUNO, carregando turmas com ID: ${this.usuario.id}...`);
      this.turmaService.listarTurmasPorAluno(this.usuario.id, pageable).subscribe({
        next: (res) => {
          console.log("Turmas do aluno recebidas:", res);
          this.atualizarEstadoTurmas(res);
        },
        error: (err) => console.error('Erro ao carregar turmas do aluno:', err)
      });

    } else {
      console.warn(`Role desconhecida: ${this.usuario.role}. Nenhuma busca será feita.`);
    }
  }

  /**
   * Atualiza o estado das turmas com a resposta da API.
   * 
   * @param res - Resposta da API contendo as turmas e dados de paginação.
   */
  private atualizarEstadoTurmas(res: any): void {
    if (!res || !res.content) {
      console.error(`Erro: Resposta da API inválida ou sem conteúdo.`);
      return;
    }

    console.log(`Atualizando estado das turmas...`);
    this.turmas = res.content;
    this.currentPage = res.page.number;
    this.size = res.page.size;
    this.totalElements = res.page.totalElements;

    console.log(`Total de turmas recebidas: ${this.turmas.length}`);
  }

  /**
   * Carrega os professores da aplicação e atualiza o mapa de professores.
   */
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

  /**
   * Carrega os alunos matriculados em uma turma.
   * 
   * @param turmaId - ID da turma para carregar os alunos.
   */
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

  /**
   * Trata o evento de seleção de um arquivo de imagem.
   * 
   * @param event - Evento disparado ao selecionar um arquivo.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0]; //pega o primeiro arquvo selecionado
      this.novaImagem = file; //armazena o arquivo para envio posterior
      console.log("Imagem selecionada:", file.name);
    }
  }

  /**
   * Cria uma nova postagem no mural da turma selecionada.
   */
  criarPostagem(): void {
    if (!this.novaPostagem.titulo || !this.novaPostagem.conteudo) {
      Swal.fire('Atenção!', 'Preencha todos os campos antes de publicar!', 'warning');
      return;
    }

    if (this.turmaSelecionada?.id) {
      const formData = new FormData();

      // Adiciona os dados do mural no FormData
      const muralRequest = {
        titulo: this.novaPostagem.titulo,
        conteudo: this.novaPostagem.conteudo,
        turmaId: this.turmaSelecionada.id,
        professorId: this.usuario.id
      };

      formData.append("mural", new Blob([JSON.stringify(muralRequest)], { type: "application/json" }));

      // Adiciona a imagem ao FormData (se existir)
      if (this.novaImagem) {
        formData.append("imagem", this.novaImagem);
      }

      // Faz a requisição ao serviço
      this.muralService.criarPostagem(formData).subscribe({
        next: (res) => {
          this.postagens.unshift(res);
          this.novaPostagem = { titulo: '', conteudo: '' };
          this.novaImagem = null; // Reseta a imagem selecionada

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

  /**
   * Exclui uma postagem do mural da turma selecionada.
   * 
   * @param id - ID da postagem a ser excluída.
   */
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

  /**
   * Carrega as postagens de uma turma selecionada.
   * 
   * @param turmaId - ID da turma para carregar as postagens.
   */
  private carregarPostagens(turmaId?: number): void {
    const id = turmaId ?? this.turmaSelecionada?.id;
    if (!id) {
      console.warn("Nenhuma turma selecionada para carregar postagens.");
      return;
    }

    const pageable = { page: this.currentPagePostagens, size: this.sizePostagens };

    this.muralService.listarPostagens(id, pageable).subscribe({
      next: (res) => {
        console.log("Postagens recebidas:", res);

        if (res && res.content) {
          this.postagens = res.content;  // Armazena as postagens corretamente
          this.currentPagePostagens = res.page.number;
          this.sizePostagens = res.page.size;
          this.totalPostagens = res.page.totalElements;
        } else {
          console.warn("Resposta inesperada da API. Estrutura dos dados pode ter mudado.");
        }
      },
      error: (err) => console.error('Erro ao carregar postagens:', err)
    });
  }

  /**
   * Abre o modal de detalhes de uma postagem.
   * 
   * @param postagem - A postagem a ser exibida no modal.
   */
  abrirModal(postagem: any): void {
    this.postagemSelecionada = postagem;
  }

  /**
   * Fecha o modal de detalhes da postagem.
   */
  fecharModal(): void {
    this.postagemSelecionada = null;
  }

}