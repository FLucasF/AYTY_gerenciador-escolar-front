import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurmaService } from '../../../services/turma.service';
import { ProfessorService } from '../../../services/professor.service';
import { Turma } from '../../../models/turma.model';
import { Professor } from '../../../models/professor.model';
import { Pageable } from '../../../models/pageable.model';
import { Page } from '../../../models/page.model';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-admin-turmas',
  standalone: false,
  templateUrl: './admin-turmas.component.html',
  styleUrls: ['./admin-turmas.component.css']
})
export class AdminTurmasComponent implements OnInit {

  // Dados paginados e mapeamento de professores
  currentPageTurmas?: Page<Turma>;
  turmas: Turma[] = [];
  professores: Professor[] = [];
  professoresMap = new Map<number, string>();

  // Propriedades do paginator
  pageIndex: number = 0;
  pageSize: number = 5;
  totalElements: number = 0;

  // Formulários e controle de edição
  novaTurmaForm!: FormGroup;
  editForm!: FormGroup;
  turmaEditando: Turma | null = null;
  turmaOriginal: Partial<Turma> = {};

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
  }

  /**
   * Inicializa os formulários de cadastro e edição de turma.
   */
  private initializeForms(): void {
    this.novaTurmaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      semestre: ['', [Validators.required, Validators.pattern(/^\d{4}\/[1-2]$/)]],
      professorId: [null]
    });

    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      semestre: ['', [Validators.required, Validators.pattern(/^\d{4}\/[1-2]$/)]],
      professorId: [null]
    });
  }

  /**
   * Carrega os dados iniciais: turmas e professores.
   */
  private loadInitialData(): void {
    this.loadTurmas();
    this.loadProfessores();
  }

  /**
   * Carrega as turmas com base na página e no tamanho da página.
   * Se houver evento de paginação, atualiza os parâmetros.
   */
  loadTurmas(event?: PageEvent): void {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    const pageable: Pageable = { page: this.pageIndex, size: this.pageSize };

    this.turmaService.listarTodasTurmas(pageable).subscribe({
      next: (res: any) => { // Mudando para `any` para refletir o JSON corretamente
        console.log("Dados recebidos do backend:", res);

        // Acessando corretamente os dados paginados
        this.turmas = res.content;
        this.pageIndex = res.page.number; // Página atual
        this.pageSize = res.page.size; // Tamanho da página
        this.totalElements = res.page.totalElements; // Total de elementos
      },
      error: (err) => console.error('Erro ao carregar turmas:', err)
    });
  }

  /**
   * Evento acionado pelo paginator para mudança de página.
   */
  onPageChange(event: PageEvent): void {
    this.loadTurmas(event);
  }

  /**
   * Carrega os professores e atualiza o Map para exibição.
   */
  loadProfessores(): void {
    this.professorService.listarProfessores().subscribe({
      next: (res) => {
        this.professores = res.content;
        this.updateProfessoresMap();
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  /**
   * Atualiza o Map de professores com base na lista carregada.
   */
  private updateProfessoresMap(): void {
    this.professoresMap.clear();
    this.professores.forEach(professor => {
      if (professor.id != null) {
        this.professoresMap.set(professor.id, professor.nome);
      }
    });
  }

  /**
   * Adiciona uma nova turma, validando o formulário.
   */
  addTurma(): void {
    if (this.novaTurmaForm.invalid) {
      alert('Todos os campos devem ser preenchidos corretamente!');
      return;
    }
    const novaTurma: Partial<Turma> = {
      nome: this.novaTurmaForm.get('nome')?.value,
      codigo: this.novaTurmaForm.get('codigo')?.value,
      semestre: this.novaTurmaForm.get('semestre')?.value,
      professorId: this.novaTurmaForm.get('professorId')?.value
    };

    this.turmaService.adicionarTurma(novaTurma).subscribe({
      next: () => {
        this.loadTurmas();
        this.novaTurmaForm.reset();
      },
      error: (err) => console.error('Erro ao adicionar turma:', err)
    });
  }

  /**
   * Inicia a edição de uma turma, armazenando seus dados originais
   * e populando o formulário de edição.
   */
  startEdit(turma: Turma): void {
    this.turmaEditando = { ...turma };
    this.turmaOriginal = { ...turma };
    this.editForm.patchValue({
      nome: turma.nome,
      codigo: turma.codigo,
      semestre: turma.semestre,
      professorId: turma.professorId
    });
  }

  /**
   * Salva a edição realizada enviando os dados atualizados para o backend.
   */
  saveEdit(): void {
    if (!this.turmaEditando?.id || this.editForm.invalid) {
      console.error('Formulário inválido ou turma a ser editada não definida.');
      return;
    }

    const dadosAtualizados: Partial<Turma> = {
      nome: this.editForm.get('nome')?.value || this.turmaOriginal.nome,
      codigo: this.editForm.get('codigo')?.value || this.turmaOriginal.codigo,
      semestre: this.editForm.get('semestre')?.value || this.turmaOriginal.semestre,
      professorId: this.editForm.get('professorId')?.value || this.turmaOriginal.professorId
    };

    this.turmaService.atualizarTurma(this.turmaEditando.id, dadosAtualizados).subscribe({
      next: (turmaAtualizada) => {
        const index = this.turmas.findIndex(t => t.id === turmaAtualizada.id);
        if (index !== -1) {
          this.turmas[index] = turmaAtualizada;
        }
        this.turmaEditando = null;
      },
      error: (err) => console.error('Erro ao atualizar turma:', err)
    });
  }

  /**
   * Cancela a edição atual, limpando os dados da turma em edição.
   */
  cancelEdit(): void {
    this.turmaEditando = null;
  }

  /**
   * Exclui uma turma após confirmação do usuário.
   */
  deleteTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluirTurma(id).subscribe({
        next: () => this.loadTurmas(),
        error: (err) => console.error(`Erro ao excluir turma ${id}:`, err)
      });
    }
  }

  /**
   * Navega para a página de gerenciamento de alunos da turma selecionada.
   */
  navigateToManageStudents(turmaId: number | undefined): void {
    if (!turmaId) {
      console.error('ID da turma indefinido.');
      return;
    }
    this.router.navigate(['/admin', 'turmas', turmaId, 'gerenciar-alunos'])
      .catch(err => console.error('Erro na navegação:', err));
  }
}
