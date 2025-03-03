import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurmaService } from '../../../services/turma.service';
import { ProfessorService } from '../../../services/professor.service';
import { Turma } from '../../../models/turma.model';
import { Professor } from '../../../models/professor.model';
import { Page } from '../../../models/page.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-turmas',
  standalone: false,
  templateUrl: './admin-turmas.component.html',
  styleUrls: ['./admin-turmas.component.css'],
})
export class AdminTurmasComponent implements OnInit {
  turmas: Turma[] = [];
  professores: Professor[] = [];
  professoresMap = new Map<number, string>();

  totalPages: number = 0;
  currentPage: number = 0;
  size: number = 10;

  novaTurmaForm!: FormGroup;
  editForm!: FormGroup;
  turmaEditando: Turma | null = null;
  turmaOriginal: any = {}; // Guarda os dados originais antes da edição

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
    this.inicializarFormularios();
    console.log('✅ AdminTurmasComponent iniciado.');
  }

  private carregarDadosIniciais(): void {
    this.carregarTurmas(0);
    this.carregarProfessores();
  }

  private inicializarFormularios(): void {
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

  carregarTurmas(page: number): void {
    this.turmaService.listarTodasTurmas(page).subscribe({
      next: (res) => {
        this.turmas = res.content;
        // Atualiza a página atual e o total de páginas a partir da resposta
        this.currentPage = res.number;
        this.totalPages = res.totalPages;
        console.log('✅ Turmas carregadas:', this.turmas);
      },
      error: (err) => console.error('❌ Erro ao carregar turmas:', err),
    });
  }
  
  carregarProfessores(): void {
    this.professorService.listarProfessores().subscribe({
      next: (res) => {
        this.professores = res.content;
        this.atualizarProfessoresMap();
        console.log('✅ Professores carregados:', this.professores);
      },
      error: (err) => console.error('❌ Erro ao carregar professores:', err),
    });
  }

  private atualizarProfessoresMap(): void {
    this.professoresMap.clear();
    this.professores.forEach(professor => {
      if (professor.id != null) {
        this.professoresMap.set(professor.id, professor.nome);
      }
    });
  }

  adicionarTurma(): void {
    if (this.novaTurmaForm.invalid) {
      alert("Todos os campos devem ser preenchidos corretamente!");
      return;
    }

    const turmaParaAdicionar: Partial<Turma> = {
      nome: this.novaTurmaForm.get('nome')?.value || '',
      codigo: this.novaTurmaForm.get('codigo')?.value || '',
      semestre: this.novaTurmaForm.get('semestre')?.value || '',
      professorId: this.novaTurmaForm.get('professorId')?.value || null
    };

    console.log('📤 Enviando nova turma:', turmaParaAdicionar);

    this.turmaService.adicionarTurma(turmaParaAdicionar).subscribe({
      next: (res) => {
        console.log("✅ Turma criada com sucesso:", res);
        this.turmas.push(res);
        this.novaTurmaForm.reset();
      },
      error: (err) => console.error('❌ Erro ao adicionar turma:', err)
    });
  }

  iniciarEdicao(turma: Turma): void {
    console.log('✏️ Iniciando edição da turma:', turma);

    this.turmaEditando = { ...turma };
    this.turmaOriginal = { ...turma };

    this.editForm.patchValue({
      nome: turma.nome,
      codigo: turma.codigo,
      semestre: turma.semestre,
      professorId: turma.professorId
    });
  }

  salvarEdicao(): void {
    if (!this.turmaEditando?.id || this.editForm.invalid) {
      console.error('❌ Formulário inválido. Verifique os campos.');
      return;
    }

    const dadosAtualizados: Partial<Turma> = {
      nome: this.editForm.get('nome')?.value || this.turmaOriginal.nome,
      codigo: this.editForm.get('codigo')?.value || this.turmaOriginal.codigo,
      semestre: this.editForm.get('semestre')?.value || this.turmaOriginal.semestre,
      professorId: this.editForm.get('professorId')?.value || this.turmaOriginal.professorId
    };

    console.log('📤 Enviando atualização da turma:', dadosAtualizados);

    this.turmaService.atualizarTurma(this.turmaEditando.id, dadosAtualizados).subscribe({
      next: (res) => {
        console.log('✅ Turma atualizada com sucesso:', res);
        const index = this.turmas.findIndex(t => t.id === res.id);
        if (index !== -1) {
          this.turmas[index] = res;
        }
        this.turmaEditando = null;
      },
      error: (err) => console.error('❌ Erro ao atualizar turma:', err),
    });
  }

  navegarParaGerenciarAlunos(turmaId: number | undefined): void {
    if (!turmaId) {
      console.error('[AdminTurmasComponent] ❌ Erro: turmaId está indefinido!');
      return;
    }
  
    console.log(`[AdminTurmasComponent] 🏃‍♂️ Navegando para /admin/turmas/${turmaId}/gerenciar-alunos`);
    this.router.navigate(['/admin', 'turmas', turmaId, 'gerenciar-alunos']);
  }
  

  cancelarEdicao(): void {
    this.turmaEditando = null;
  }

  excluirTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluirTurma(id).subscribe({
        next: () => {
          this.turmas = this.turmas.filter(turma => turma.id !== id);
          console.log(`✅ Turma ${id} excluída.`);
        },
        error: (err) => console.error('❌ Erro ao excluir turma:', err),
      });
    }
  }

  mudarPagina(page: number): void {
    console.log(`📜 Mudando para página: ${page}`);
    if (page < 0 || page >= this.totalPages) {
      console.warn("⚠️ Tentativa de acessar página inválida!");
      return;
    }
    this.carregarTurmas(page);
  }
}
