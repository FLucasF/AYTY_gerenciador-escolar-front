import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Administrador } from '../../../models/administrador.model';
import { Professor } from '../../../models/professor.model';
import { Aluno } from '../../../models/aluno.model';
import { Turma } from '../../../models/turma.model';
import { AdministradorService } from '../../../services/administrador.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/aluno.service';
import { TurmaService } from '../../../services/turma.service';

@Component({
  selector: 'app-admin-user-register',
  standalone: false,
  templateUrl: './admin-user-register.component.html',
  styleUrls: ['./admin-user-register.component.css']
})
export class AdminUserRegisterComponent {
  tipoUsuarioSelecionado: 'administrador' | 'professor' | 'aluno' = 'administrador';

  admin: Administrador = {
    nome: '',
    email: '',
    senha: '',
    setor: '',
    siape: '',
    role: 'ROLE_ADMIN'
  };

  professor: Professor = {
    nome: '',
    email: '',
    senha: '',
    departamento: '',
    siape: '',
    turmas: [], // Armazena os IDs das turmas
    role: 'ROLE_PROFESSOR'
  };

  aluno: Aluno = {
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    curso: '',
    turmas: [], // Armazena os IDs das turmas
    role: 'ROLE_ALUNO'
  };

  turmasDisponiveis: Turma[] = []; // Lista de turmas carregadas do backend

  constructor(
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private turmaService: TurmaService
  ) {}

  ngOnInit(): void {
    this.carregarTurmas();
    console.log('🚀 Componente de cadastro de usuários carregado!');
  }

  /**
   * Retorna o objeto correspondente ao tipo de usuário selecionado.
   */
  getUsuario(): any {
    switch (this.tipoUsuarioSelecionado) {
      case 'administrador': return this.admin;
      case 'professor': return this.professor;
      case 'aluno': return this.aluno;
      default: return {};
    }
  }

  /**
   * Carrega todas as turmas disponíveis para seleção.
   */
  carregarTurmas(): void {
    this.turmaService.listarTodasTurmas({ page: 0, size: 10 }).subscribe({
      next: (res) => {
        // Extraímos o array de turmas da propriedade content
        this.turmasDisponiveis = res.content;
        console.log('📚 Turmas carregadas:', res.content);
      },
      error: (err) => console.error('❌ Erro ao carregar turmas:', err)
    });
  }
  
  /**
   * Salva o usuário baseado no tipo selecionado.
   */
  salvarUsuario(): void {
    let request: Observable<Administrador | Professor | Aluno> | null = null;

    switch (this.tipoUsuarioSelecionado) {
      case 'administrador':
        request = this.adminService.cadastrarAdministrador(this.admin);
        break;
      case 'professor':
        request = this.professorService.cadastrarProfessor(this.professor);
        break;
      case 'aluno':
        request = this.alunoService.cadastrarAluno(this.aluno);
        break;
    }

    if (request) {
      request.subscribe({
        next: (res) => {
          console.log('✅ Usuário cadastrado com sucesso!', res);
          this.resetarFormulario();
        },
        error: (err) => {
          console.error('❌ Erro ao cadastrar usuário:', err);
        }
      });
    }
  }

  /**
   * Reseta os formulários para os valores iniciais.
   */
  resetarFormulario(): void {
    this.admin = { nome: '', email: '', senha: '', setor: '', siape: '', role: 'ROLE_ADMIN' };
    this.professor = { nome: '', email: '', senha: '', departamento: '', siape: '', turmas: [], role: 'ROLE_PROFESSOR' };
    this.aluno = { nome: '', email: '', senha: '', cpf: '', curso: '', turmas: [], role: 'ROLE_ALUNO' };
  }
}
