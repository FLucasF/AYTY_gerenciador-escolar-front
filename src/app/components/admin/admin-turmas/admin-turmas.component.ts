import { Component, OnInit } from '@angular/core';
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

  // Controle do modal de gerenciamento de alunos
  mostrarGerenciarAlunosModal = false;
  turmaGerenciarAlunos: Turma | null = null;
  alunoSelecionadoParaAdicionar: number | null = null;

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private alunoService: AlunoService
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
    console.log('AdminTurmasComponent iniciado.');
  }

  private carregarDadosIniciais(): void {
    this.carregarTurmas();
    this.carregarProfessores();
    this.carregarTodosAlunos();
  }

  carregarTurmas(): void {
    this.turmaService.listarTurmas().subscribe({
      next: (res) => {
        this.turmas = res.content;
      },
      error: (err) => console.error('Erro ao carregar turmas:', err),
    });
  }

  carregarProfessores(): void {
    this.professorService.listarProfessores().subscribe({
      next: (res) => {
        this.professores = res.content;
        this.atualizarProfessoresMap();
      },
      error: (err) => console.error('Erro ao carregar professores:', err),
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
      },
      error: (err) => console.error('Erro ao carregar alunos:', err),
    });
  }

  abrirGerenciarAlunos(turma: Turma): void {
    if (!turma.id) {
      console.error('Turma sem ID não pode ser gerenciada.');
      return;
    }
    this.turmaGerenciarAlunos = turma;
    this.turmaService.listarAlunosPorTurma(turma.id).subscribe({
      next: (res) => {
        this.alunosMatriculados = res.content;
      },
      error: (err) => console.error('Erro ao carregar alunos da turma:', err),
    });
    this.mostrarGerenciarAlunosModal = true;
  }

  adicionarTurma(): void {
    if (!this.novaTurma.nome) {
      alert("O nome da turma é obrigatório!");
      return;
    }
    const turmaParaAdicionar = {
      nome: this.novaTurma.nome,
      professorId: this.novaTurma.professorId || null
    };
    this.turmaService.adicionarTurma(turmaParaAdicionar).subscribe({
      next: (res) => {
        this.turmas.push(res);
        this.novaTurma = { nome: '', professorId: null };
      },
      error: (err) => console.error('Erro ao adicionar turma:', err),
    });
  }

  excluirTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluirTurma(id).subscribe({
        next: () => {
          this.turmas = this.turmas.filter(turma => turma.id !== id);
        },
        error: (err) => console.error('Erro ao excluir turma:', err),
      });
    }
  }

  iniciarEdicao(turma: Turma): void {
    this.turmaEditando = { ...turma };
  }

  salvarEdicao(): void {
    if (!this.turmaEditando?.id) {
      return;
    }
    const turmaAtualizada = {
      id: this.turmaEditando.id,
      nome: this.turmaEditando.nome,
      professorId: this.turmaEditando.professorId || null
    };
    this.turmaService.atualizarTurma(turmaAtualizada.id, turmaAtualizada).subscribe({
      next: (res) => {
        const index = this.turmas.findIndex(t => t.id === res.id);
        if (index !== -1) { this.turmas[index] = res; }
        this.turmaEditando = null;
      },
      error: (err) => console.error('Erro ao atualizar turma:', err),
    });
  }

  cancelarEdicao(): void {
    this.turmaEditando = null;
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
      error: (err) => console.error('Erro ao matricular aluno:', err),
    });
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
        this.turmaService.listarAlunosPorTurma(turmaId).subscribe({
          next: (res) => {
            this.alunosMatriculados = res.content || [];
          },
          error: (err) => console.error("Erro ao recarregar alunos da turma:", err),
        });
      },
      error: (err) => console.error("Erro ao remover aluno da turma:", err),
    });
  }

  getAlunosDisponiveis(): Aluno[] {
    return this.todosAlunos.filter(aluno => 
      !this.alunosMatriculados.some(matriculado => matriculado.id === aluno.id)
    );
  }
}
