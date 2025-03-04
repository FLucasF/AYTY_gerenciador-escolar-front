import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../services/turma.service';
import { AlunoService } from '../../../services/aluno.service';
import { Page } from '../../../models/page.model';
import { Aluno } from '../../../models/aluno.model';
import { Turma } from '../../../models/turma.model';
import { PageEvent } from '@angular/material/paginator';

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
  alunoSelecionadoParaAdicionar: number | null = null;
  loadingAlunos = true;

  // Paginação
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turmaService: TurmaService,
    private alunoService: AlunoService
  ) {}

  ngOnInit(): void {
    console.log('[GerenciarAlunoTurmaComponent] 🚀 Iniciado!');

    this.route.params.subscribe(params => {
      this.turmaId = +params['id'];

      if (!this.turmaId || isNaN(this.turmaId)) {
        console.warn('[GerenciarAlunoTurmaComponent] 🚨 ID da turma inválido, retornando...');
        this.router.navigate(['/admin/turmas']);
        return;
      }

      this.carregarTurma();
      this.carregarAlunosDaTurma();
      this.carregarTodosAlunos();
    });
  }

  private carregarTurma(): void {
    if (!this.turmaId) return;

    this.turmaService.buscarTurmaPorId(this.turmaId).subscribe({
      next: (turma: Turma) => {
        this.turmaNome = turma.nome;
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Turma carregada: ${turma.nome}`);
      },
      error: (err) => console.error('❌ Erro ao carregar turma:', err)
    });
  }

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
        console.log(`[GerenciarAlunoTurmaComponent] ✅ Alunos carregados para a turma ${this.turmaId}`);
      },
      error: (err) => console.error('❌ Erro ao carregar alunos:', err)
    });
  }

  private carregarTodosAlunos(): void {
    this.alunoService.listarAlunos(0, 1000).subscribe({
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
        this.carregarAlunosDaTurma();
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
        this.carregarAlunosDaTurma();
      },
      error: (err) => console.error('❌ Erro ao remover aluno:', err)
    });
  }

  voltarParaTurmas(): void {
    console.log(`[GerenciarAlunoTurmaComponent] ⏪ Retornando para lista de turmas.`);
    this.router.navigate(['/admin/turmas']);
  }
}
