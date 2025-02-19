import { Component, OnInit } from '@angular/core';
import { TurmaService } from '../../../services/turma/turma.service';
import { ProfessorService } from '../../../services/professor/professor.service';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Turma } from '../../../models/turma.model';
import { Professor } from '../../../models/professor.model';
import { Aluno } from '../../../models/aluno.model';

@Component({
  selector: 'app-admin-turmas',
  standalone: false,
  templateUrl: './admin-turmas.component.html',
  styleUrls: ['./admin-turmas.component.css']
})
export class AdminTurmasComponent implements OnInit {
  turmas: Turma[] = [];
  professores: Professor[] = [];
  todosAlunos: Aluno[] = [];
  alunosMatriculados: Aluno[] = [];
  professoresMap = new Map<number, string>();

  novaTurma: Partial<Turma> & { professorId?: number | null } = { nome: '', professorId: null };
  turmaEditando: Turma | null = null;

  // Modal de gerenciamento de alunos
  mostrarGerenciarAlunosModal: boolean = false;
  turmaGerenciarAlunos: Turma | null = null;
  alunoSelecionadoParaAdicionar: number | null = null;

  constructor(
    private turmaService: TurmaService,
    private professorService: ProfessorService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarTurmas();
    this.carregarProfessores();
    this.carregarTodosAlunos();
  }

  carregarTurmas(): void {
    this.turmaService.listarTurmas().subscribe({
      next: (res) => {
        this.turmas = res;
        console.log('Turmas carregadas:', res);
      },
      error: (err) => console.error('Erro ao carregar turmas:', err)
    });
  }

  carregarProfessores(): void {
    this.professorService.listarProfessores().subscribe({
      next: (res) => {
        this.professores = res;
        this.professoresMap.clear();
        res.forEach(professor => {
          if (professor.id != null) {
            this.professoresMap.set(professor.id, professor.nome);
          }
        });
        console.log('Professores carregados:', res);
      },
      error: (err) => console.error('Erro ao carregar professores:', err)
    });
  }

  carregarTodosAlunos(): void {
    this.usuarioService.listarAlunos().subscribe({
      next: (res: Aluno[]) => {
        this.todosAlunos = res;
        console.log('Todos os alunos carregados:', res);
      },
      error: (err) => console.error('Erro ao carregar todos os alunos:', err)
    });
  }

  adicionarTurma(): void {
    if (!this.novaTurma.nome) {
      alert("O nome da turma é obrigatório!");
      return;
    }
    console.log('Adicionando turma com dados:', this.novaTurma);
    const turmaParaAdicionar: any = {
      nome: this.novaTurma.nome,
      professor: this.novaTurma.professorId ? { id: this.novaTurma.professorId } : null
    };
    this.turmaService.adicionarTurma(turmaParaAdicionar).subscribe({
      next: (res) => {
        console.log("Turma adicionada com sucesso:", res);
        this.turmas.push(res);
        this.novaTurma = { nome: '', professorId: null };
      },
      error: (err) => console.error('Erro ao adicionar turma:', err)
    });
  }

  excluirTurma(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      this.turmaService.excluirTurma(id).subscribe({
        next: () => {
          console.log(`Turma com id ${id} excluída.`);
          this.turmas = this.turmas.filter(turma => turma.id !== id);
        },
        error: (err) => console.error('Erro ao excluir turma:', err)
      });
    }
  }

  iniciarEdicao(turma: Turma): void {
    this.turmaEditando = { ...turma };
  }

  salvarEdicao(): void {
    if (!this.turmaEditando || !this.turmaEditando.id) {
      console.error('Turma em edição ou seu id não definido.');
      return;
    }
    const turmaAtualizada: any = {
      id: this.turmaEditando.id,
      nome: this.turmaEditando.nome,
      codigo: this.turmaEditando.codigo ?? undefined,
      semestre: this.turmaEditando.semestre ?? undefined,
      professor: this.turmaEditando.professorId ? { id: this.turmaEditando.professorId } : null
    };
    this.turmaService.atualizarTurma(turmaAtualizada.id, turmaAtualizada).subscribe({
      next: (res) => {
        const index = this.turmas.findIndex(t => t.id === res.id);
        if (index !== -1) {
          this.turmas[index] = res;
        }
        this.turmaEditando = null;
      },
      error: (err) => console.error('Erro ao atualizar turma:', err)
    });
  }

  cancelarEdicao(): void {
    this.turmaEditando = null;
  }

  // Gerenciamento de alunos na turma

  abrirGerenciarAlunos(turma: Turma): void {
    if (!turma.id) {
      console.error('Turma sem ID não pode ser gerenciada.');
      return;
    }
    this.turmaGerenciarAlunos = turma;
    this.turmaService.listarAlunosPorTurma(turma.id).subscribe({
      next: (res) => {
        this.alunosMatriculados = res;
        console.log('Alunos matriculados na turma:', res);
      },
      error: (err) => console.error('Erro ao carregar alunos da turma:', err)
    });
    this.mostrarGerenciarAlunosModal = true;
  }

  adicionarAlunoNaTurma(): void {
    if (!this.turmaGerenciarAlunos || !this.turmaGerenciarAlunos.id) {
      console.error('Nenhuma turma selecionada para matrícula.');
      return;
    }
    if (this.alunoSelecionadoParaAdicionar == null) {
      alert("Selecione um aluno para matricular.");
      return;
    }
    console.log(`Matriculando aluno ${this.alunoSelecionadoParaAdicionar} na turma ${this.turmaGerenciarAlunos.id}`);
    this.turmaService.matricularAluno(this.turmaGerenciarAlunos.id, this.alunoSelecionadoParaAdicionar).subscribe({
      next: (res) => {
        console.log("Aluno matriculado com sucesso na turma:", res);
        this.turmaService.listarAlunosPorTurma(this.turmaGerenciarAlunos!.id!).subscribe({
          next: (alunos) => {
            this.alunosMatriculados = alunos;
            console.log("Lista atualizada de alunos matriculados:", alunos);
          },
          error: (err) => console.error('Erro ao atualizar alunos matriculados:', err)
        });
      },
      error: (err) => console.error('Erro ao matricular aluno:', err)
    });
  }

  removerAlunoDaTurma(alunoId: number): void {
    if (!this.turmaGerenciarAlunos || !this.turmaGerenciarAlunos.id) {
      console.error('Nenhuma turma selecionada para remover aluno.');
      return;
    }
    console.log(`Removendo aluno ${alunoId} da turma ${this.turmaGerenciarAlunos.id}`);
    this.turmaService.removerAlunoDaTurma(this.turmaGerenciarAlunos.id, alunoId).subscribe({
      next: (res) => {
        console.log("Aluno removido com sucesso da turma:", res);
        this.turmaService.listarAlunosPorTurma(this.turmaGerenciarAlunos!.id!).subscribe({
          next: (alunos) => {
            this.alunosMatriculados = alunos;
            console.log("Lista atualizada de alunos matriculados:", alunos);
          },
          error: (err) => console.error('Erro ao atualizar alunos matriculados:', err)
        });
      },
      error: (err) => console.error('Erro ao remover aluno da turma:', err)
    });
  }

  fecharGerenciarAlunosModal(): void {
    this.mostrarGerenciarAlunosModal = false;
    this.turmaGerenciarAlunos = null;
    this.alunoSelecionadoParaAdicionar = null;
    this.alunosMatriculados = [];
  }

  // Método para filtrar alunos disponíveis para matrícula (que ainda não estão na turma)
  getAlunosDisponiveis(): Aluno[] {
    return this.todosAlunos.filter(a => !this.alunosMatriculados.some(m => m.id === a.id));
  }
}
