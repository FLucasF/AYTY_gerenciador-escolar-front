import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Importa os modelos individualmente
import { Administrador } from '../../../models/administrador.model';
import { Professor } from '../../../models/professor.model';
import { Aluno } from '../../../models/aluno.model';

// Importa os serviços separados
import { AdministradorService } from '../../../services/admin/administrador.service';
import { ProfessorService } from '../../../services/professor/professor.service';
import { AlunoService } from '../../../services/aluno/aluno.service';

// Cria um tipo união para simplificar o uso no componente:
export type Usuario = Administrador | Professor | Aluno;

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  tipoUsuarioSelecionado: 'todos' | 'administrador' | 'professor' | 'aluno' = 'todos';
  usuarios: Usuario[] = [];

  constructor(
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    forkJoin({
      administradores: this.adminService.listarAdministradores(),
      professores: this.professorService.listarProfessores(),
      alunos: this.alunoService.listarAlunos()
    }).subscribe({
      next: ({ administradores, professores, alunos }) => {
        this.usuarios = [
          ...administradores.map(admin => ({ ...admin, tipo: 'administrador' as const })),
          ...professores.map(prof => ({ ...prof, tipo: 'professor' as const })),
          ...alunos.map(aluno => ({ ...aluno, tipo: 'aluno' as const }))
        ];
      },
      error: err => console.error('Erro ao carregar usuários:', err)
    });
  }

  filtrarUsuarios(): Usuario[] {
    if (this.tipoUsuarioSelecionado === 'todos') {
      return this.usuarios;
    } else {
      return this.usuarios.filter(user => user.tipo === this.tipoUsuarioSelecionado);
    }
  }

  excluirUsuario(usuario: Usuario): void {
    if (confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) {
      let request$;
      if (usuario.tipo === 'administrador') {
        request$ = this.adminService.excluirAdministrador(usuario.id!);
      } else if (usuario.tipo === 'professor') {
        request$ = this.professorService.excluirProfessor(usuario.id!);
      } else if (usuario.tipo === 'aluno') {
        request$ = this.alunoService.excluirAluno(usuario.id!);
      }
      if (request$) {
        request$.subscribe({
          next: () => this.carregarUsuarios(),
          error: err => console.error(`Erro ao excluir ${usuario.tipo}:`, err)
        });
      }
    }
  }

  irParaCadastro(): void {
    this.router.navigate(['/admin/cadastro']);
  }
}
