import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurmaService } from '../../../services/turma.service';
import { ProfessorService } from '../../../services/professor.service';
import { Turma } from '../../../models/turma.model';
import { Professor } from '../../../models/professor.model';
import { Page } from '../../../models/page.model';
import { Router } from '@angular/router'; // ✅ Importação correta do Router


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

  novaTurma: Partial<Turma> & { professorId?: number | null } = { nome: '', professorId: null };
  turmaEditando: Turma | null = null;

  editForm!: FormGroup;
  novaTurmaForm!: FormGroup;
  
  turmaOriginal: any = {}; // Guarda os dados originais antes da edição

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
    this.inicializarFormularioEdicao();
    this.inicializarFormularioNovaTurma();
    console.log('✅ AdminTurmasComponent iniciado.');
  }

  private carregarDadosIniciais(): void {
    this.carregarTurmas();
    this.carregarProfessores();
  }

  private inicializarFormularioEdicao(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]], // Apenas letras e espaços
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]], // Apenas letras e números, sem espaços
      semestre: ['', [Validators.required, Validators.pattern(/^\d{4}\/[1-2]$/)]], // Formato YYYY/1 ou YYYY/2
      professorId: [null]
    });
  }
  
  private inicializarFormularioNovaTurma(): void {
    this.novaTurmaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      semestre: ['', [Validators.required, Validators.pattern(/^\d{4}\/[1-2]$/)]],
      professorId: [null]    
    });
  }
  
  navegarParaGerenciarAlunos(turmaId: number | undefined): void {
    if (!turmaId) {
      console.error('[AdminTurmasComponent] ❌ Erro: turmaId está indefinido!', turmaId);
      return;
    }
  
    console.log(`[AdminTurmasComponent] 🏃‍♂️ Navegando para /admin/turmas/${turmaId}/gerenciar-alunos`);
    this.router.navigate(['/admin', 'turmas', turmaId, 'gerenciar-alunos']);
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
    if (!this.turmaEditando?.id || this.editForm.invalid) { // Se o formulário for inválido, não salva
      console.error('❌ Formulário inválido. Verifique os campos.');
      return;
    }
  
    // Monta um objeto com os dados do formulário, mantendo os originais se o campo estiver vazio ou inalterado
    const dadosAtualizados: any = {};
    Object.keys(this.editForm.value).forEach(key => {
      const novoValor = this.editForm.value[key];
      if (novoValor !== '' && novoValor !== this.turmaOriginal[key]) {
        dadosAtualizados[key] = novoValor;
      } else {
        dadosAtualizados[key] = this.turmaOriginal[key];
      }
    });
  
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

  cancelarEdicao(): void {
    this.turmaEditando = null;
  }

  carregarTurmas(): void {
    const pageable = { page: 0, size: 10 };
  
    this.turmaService.listarTodasTurmas(pageable).subscribe({
      next: (res) => {
        this.turmas = res.content;
        console.log('✅ Turmas carregadas:', this.turmas);  // 🔍 Verificar se os IDs estão corretos
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

  excluirTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluirTurma(id).subscribe({
        next: () => {
          this.turmas = this.turmas.filter(turma => turma.id !== id);
        },
        error: (err) => console.error('❌ Erro ao excluir turma:', err),
      });
    }
  }
  
  adicionarTurma(): void {
    if (this.novaTurmaForm.invalid) {
      alert("Todos os campos devem ser preenchidos corretamente!");
      return;
    }
  
    const turmaParaAdicionar = {
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
        this.novaTurmaForm.reset(); // Resetar o formulário
      },
      error: (err) => console.error('❌ Erro ao adicionar turma:', err)
    });
  } 
}