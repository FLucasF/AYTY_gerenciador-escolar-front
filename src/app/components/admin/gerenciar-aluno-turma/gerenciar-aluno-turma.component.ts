import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // ✅ Importação correta do Router
import { TurmaService } from '../../../services/turma.service';
import { AlunoService } from '../../../services/aluno.service';
import { Page } from '../../../models/page.model';
import { Aluno } from '../../../models/aluno.model';
import { Turma } from '../../../models/turma.model';

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
  alunoSelecionadoParaAdicionar: number | null = null;
  todosAlunos: Aluno[] = [];
  loadingAlunos = true;
  size = 10;
  currentPage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // ✅ Correção do Router
    private turmaService: TurmaService,
    private alunoService: AlunoService
  ) {}

  ngOnInit(): void {
    console.log('[GerenciarAlunoTurmaComponent] 🚀 Iniciado!');
    
    this.route.params.subscribe(params => {
      console.log(`[GerenciarAlunoTurmaComponent] 🔍 Parâmetro recebido:`, params);
  
      this.turmaId = +params['id']; // Certifique-se de converter para número
  
      if (!this.turmaId || isNaN(this.turmaId)) {
        console.warn('[GerenciarAlunoTurmaComponent] 🚨 ID da turma inválido, retornando...');
        this.router.navigate(['/admin/turmas']);
        return;
      }
  
      console.log(`[GerenciarAlunoTurmaComponent] 📂 Carregando dados da turma ${this.turmaId}`);
      this.carregarDados();
    });
  }
  
  

  private carregarDados(): void {
    this.carregarTurma();
    this.carregarAlunosDaTurma();
    this.carregarTodosAlunos();
  }

  private carregarTurma(): void {
    if (!this.turmaId) return;
    
    this.turmaService.buscarTurmaPorId(this.turmaId).subscribe({
      next: (turma: Turma) => {
        this.turmaNome = turma.nome;
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Turma carregada: ${turma.nome}`);
      },
      error: (err: any) => console.error('❌ Erro ao carregar turma:', err)
    });
  }

  carregarAlunosDaTurma(page: number = 0): void {
    if (!this.turmaId) return;

    this.currentPage = page;
    this.turmaService.listarAlunosPorTurma(this.turmaId, { page, size: this.size }).subscribe({
      next: (res) => {
        this.paginaAlunos = res;
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Alunos carregados para a turma ${this.turmaId}`);
      },
      error: (err) => console.error('❌ Erro ao carregar alunos:', err)
    });
  }

  private carregarTodosAlunos(page: number = 0, size: number = 1000): void {
    this.alunoService.listarAlunos(page, size).subscribe({
      next: (res) => {
        this.todosAlunos = res.content;
        this.loadingAlunos = false;
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Todos os alunos carregados.`);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar alunos:', err);
        this.loadingAlunos = false;
      }
    });
  }

  adicionarAlunoNaTurma(): void {
    if (!this.turmaId || !this.alunoSelecionadoParaAdicionar) return;

    this.turmaService.matricularAluno(this.turmaId, this.alunoSelecionadoParaAdicionar).subscribe({
      next: () => {
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Aluno ${this.alunoSelecionadoParaAdicionar} matriculado!`);
        this.carregarAlunosDaTurma(this.currentPage);
        this.alunoSelecionadoParaAdicionar = null;
      },
      error: (err) => console.error('❌ Erro ao matricular aluno:', err)
    });
  }

  removerAlunoDaTurma(alunoId: number): void {
    if (!this.turmaId) return;

    this.turmaService.removerAlunoDaTurma(this.turmaId, alunoId).subscribe({
      next: () => {
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Aluno ${alunoId} removido da turma ${this.turmaId}`);
        this.carregarAlunosDaTurma(this.currentPage);
      },
      error: (err) => console.error('❌ Erro ao remover aluno:', err)
    });
  }

  mudarPaginaAlunos(newPage: number): void {
    this.carregarAlunosDaTurma(newPage);
  }

  getAlunosDisponiveis(): Aluno[] {
    return this.todosAlunos;
  }

  voltarParaTurmas(): void {
    console.log(`[GerenciarAlunoTurmaComponent] ⏪ Retornando para lista de turmas.`);
    this.router.navigate(['/admin/turmas']);
  }
}
