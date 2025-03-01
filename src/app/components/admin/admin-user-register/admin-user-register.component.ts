import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdministradorService } from '../../../services/administrador.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/aluno.service';
import { TurmaService } from '../../../services/turma.service';
import { Turma } from '../../../models/turma.model';

@Component({
  selector: 'app-admin-user-register',
  standalone: false,
  templateUrl: './admin-user-register.component.html',
  styleUrls: ['./admin-user-register.component.css']
})
export class AdminUserRegisterComponent implements OnInit {
  tipoUsuarioSelecionado: 'administrador' | 'professor' | 'aluno' = 'administrador';
  turmasDisponiveis: Turma[] = []; // Lista de turmas carregadas do backend

  usuarioForm!: FormGroup; // Formulário reativo

  constructor(
    private fb: FormBuilder,
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private turmaService: TurmaService
  ) {}

  ngOnInit(): void {
    this.carregarTurmas();
    this.inicializarFormulario();
    console.log('🚀 Componente de cadastro de usuários carregado!');
  }

  /**
   * Inicializa o formulário com validações
   */
  private inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],

      // Campos específicos por tipo de usuário
      setor: ['', []], // Administrador
      siape: ['', [Validators.pattern(/^\d{7}$/)]], // 7 dígitos obrigatórios para SIAPE
      departamento: ['', []], // Professor
      cpf: ['', [Validators.pattern(/^\d{11}$/)]], // 11 dígitos obrigatórios para CPF
      curso: ['', []], // Aluno
      turmas: [[], []] // Professores e alunos podem ter turmas
    });
  }

  /**
   * Carrega todas as turmas disponíveis para seleção.
   */
  carregarTurmas(): void {
    this.turmaService.listarTodasTurmas({ page: 0, size: 10 }).subscribe({
      next: (res) => {
        this.turmasDisponiveis = res.content;
        console.log('📚 Turmas carregadas:', res.content);
      },
      error: (err) => console.error('❌ Erro ao carregar turmas:', err)
    });
  }

  /**
   * Envia os dados do formulário para cadastro
   */
  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      console.warn('⚠️ Formulário inválido. Verifique os campos antes de enviar.');
      return;
    }

    let request: Observable<any> | null = null;
    const dadosUsuario = this.usuarioForm.value;

    switch (this.tipoUsuarioSelecionado) {
      case 'administrador':
        request = this.adminService.cadastrarAdministrador({
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          setor: dadosUsuario.setor,
          siape: dadosUsuario.siape || '',
          role: 'ROLE_ADMIN'
        });
        break;

      case 'professor':
        request = this.professorService.cadastrarProfessor({
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          departamento: dadosUsuario.departamento,
          siape: dadosUsuario.siape || '',
          turmas: dadosUsuario.turmas || [],
          role: 'ROLE_PROFESSOR'
        });
        break;

      case 'aluno':
        request = this.alunoService.cadastrarAluno({
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          cpf: dadosUsuario.cpf,
          curso: dadosUsuario.curso,
          turmas: dadosUsuario.turmas || [],
          role: 'ROLE_ALUNO'
        });
        break;
    }

    if (request) {
      request.subscribe({
        next: (res) => {
          console.log('✅ Usuário cadastrado com sucesso!', res);
          this.usuarioForm.reset();
        },
        error: (err) => console.error('❌ Erro ao cadastrar usuário:', err)
      });
    }
  }
}
