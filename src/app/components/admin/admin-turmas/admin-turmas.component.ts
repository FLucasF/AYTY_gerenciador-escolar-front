import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TurmaService } from '../../../services/turma.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/aluno.service';
import { Turma } from '../../../models/turma.model';
import { Professor } from '../../../models/professor.model';
import { Aluno } from '../../../models/aluno.model';

@Component({
  selector: 'app-admin-turmas',
  standalone: false,
  templateUrl: './admin-turmas.component.html',
  styleUrls: ['./admin-turmas.component.css'],
})
export class AdminTurmasComponent implements OnInit {
  turmas: Turma[] = [];
  professores: Professor[] = [];
  alunosMatriculados: Aluno[] = [];
  todosAlunos: Aluno[] = [];

  professoresMap = new Map<number, string>();

  novaTurma: Partial<Turma> & { professorId?: number | null } = { nome: '', professorId: null };
  turmaEditando: Turma | null = null;
  editForm!: FormGroup;
  turmaOriginal: any = {}; // Guarda os dados originais antes da edição

  // Controle do modal de gerenciamento de alunos
  mostrarGerenciarAlunosModal = false;
  turmaGerenciarAlunos: Turma | null = null;
  alunoSelecionadoParaAdicionar: number | null = null;

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
    this.inicializarFormularioEdicao();
    console.log('✅ AdminTurmasComponent iniciado.');
  }

  private carregarDadosIniciais(): void {
    this.carregarTurmas();
    this.carregarProfessores();
    this.carregarTodosAlunos();
  }

  private inicializarFormularioEdicao(): void {
    this.editForm = this.fb.group({
      nome: [''],
      codigo: [''],
      semestre: [''],
      professorId: [null]
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
    if (!this.turmaEditando?.id || !this.editForm.valid) {
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
    // Criando o objeto pageable para paginação
    const pageable = { page: 0, size: 10 };  // Ajuste o tamanho conforme necessário
    
    // Passando o parâmetro pageable para a requisição
    this.turmaService.listarTodasTurmas(pageable).subscribe({
      next: (res) => {
        this.turmas = res.content;
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

  carregarTodosAlunos(): void {
    this.alunoService.listarAlunos().subscribe({
      next: (res) => {
        this.todosAlunos = res.content || [];
        console.log('✅ Alunos carregados:', this.todosAlunos);
      },
      error: (err) => console.error('❌ Erro ao carregar alunos:', err),
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

  fecharGerenciarAlunosModal(): void {
    this.mostrarGerenciarAlunosModal = false;
    this.turmaGerenciarAlunos = null;
    this.alunoSelecionadoParaAdicionar = null;
    this.alunosMatriculados = [];
  }

  adicionarAlunoNaTurma(): void {
    if (!this.turmaGerenciarAlunos?.id) {
      return;
    }
    if (this.alunoSelecionadoParaAdicionar == null) {
      alert("Selecione um aluno para matricular.");
      return;
    }
    this.turmaService.matricularAluno(this.turmaGerenciarAlunos.id, this.alunoSelecionadoParaAdicionar).subscribe({
      next: () => {
        this.abrirGerenciarAlunos(this.turmaGerenciarAlunos!);
      },
      error: (err) => console.error('❌ Erro ao matricular aluno:', err),
    });
  }
  
  adicionarTurma(): void {
    if (!this.novaTurma.nome) {
      alert("O nome da turma é obrigatório!");
      return;
    }
  
    const turmaParaAdicionar = {
      nome: this.novaTurma.nome,
      codigo: this.novaTurma.codigo || '',
      semestre: this.novaTurma.semestre || '',
      professorId: this.novaTurma.professorId ? this.novaTurma.professorId : null
    };
  
    console.log('📤 Enviando nova turma:', turmaParaAdicionar);
  
    this.turmaService.adicionarTurma(turmaParaAdicionar).subscribe({
      next: (res) => {
        console.log("✅ Turma criada com sucesso:", res);
        this.turmas.push(res);
        this.novaTurma = { nome: '', professorId: null }; // Resetar o formulário
      },
      error: (err) => console.error('❌ Erro ao adicionar turma:', err)
    });
  }
  

  abrirGerenciarAlunos(turma: Turma): void {
    if (!turma.id) {
      console.error('❌ Erro: Turma sem ID não pode ser gerenciada.');
      return;
    }
    console.log(`📂 Abrindo gerenciamento de alunos para a turma ${turma.nome} (ID: ${turma.id})`);
  
    this.turmaGerenciarAlunos = turma;
    
    // Criando o objeto pageable para paginação
    const pageable = { page: 0, size: 10 };  // Ajuste o tamanho conforme necessário
    
    // Passando o parâmetro pageable para a requisição
    this.turmaService.listarAlunosPorTurma(turma.id, pageable).subscribe({
      next: (res) => {
        this.alunosMatriculados = res.content || [];
        console.log(`✅ Alunos matriculados na turma ${turma.nome}:`, this.alunosMatriculados);
      },
      error: (err) => console.error('❌ Erro ao carregar alunos da turma:', err),
    });
  
    this.mostrarGerenciarAlunosModal = true;
  }
  

  removerAlunoDaTurma(alunoId: number): void {
    const turmaId = this.turmaGerenciarAlunos?.id;
    if (!turmaId) {
      return;
    }
  
    if (!confirm("Tem certeza que deseja remover o aluno da turma?")) {
      return;
    }
  
    this.turmaService.removerAlunoDaTurma(turmaId, alunoId).subscribe({
      next: () => {
        // Criando o objeto pageable para paginar os alunos
        const pageable = { page: 0, size: 10 };  // Ajuste o tamanho conforme necessário
  
        // Passando o pageable para a requisição de listar alunos da turma
        this.turmaService.listarAlunosPorTurma(turmaId, pageable).subscribe({
          next: (res) => {
            this.alunosMatriculados = res.content || [];
            console.log('✅ Alunos recarregados após remoção:', this.alunosMatriculados);
          },
          error: (err) => console.error("❌ Erro ao recarregar alunos da turma:", err),
        });
      },
      error: (err) => console.error("❌ Erro ao remover aluno da turma:", err),
    });
  }
  

  getAlunosDisponiveis(): Aluno[] {
    return this.todosAlunos.filter(aluno => 
      !this.alunosMatriculados.some(matriculado => matriculado.id === aluno.id)
    );
  }
}