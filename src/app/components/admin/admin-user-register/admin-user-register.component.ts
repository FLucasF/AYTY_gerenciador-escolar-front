import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdministradorService } from '../../../services/administrador.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/aluno.service';
import { TurmaService } from '../../../services/turma.service';
import { Turma } from '../../../models/turma.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-user-register',
  standalone: false,
  templateUrl: './admin-user-register.component.html',
  styleUrls: ['./admin-user-register.component.css']
})
export class AdminUserRegisterComponent implements OnInit {
  tipoUsuarioSelecionado: 'administrador' | 'professor' | 'aluno' = 'administrador';
  turmasDisponiveis: Turma[] = []; // Se necessário para outros usos (por exemplo, professor)

  usuarioForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService,
    private turmaService: TurmaService
  ) { }

  ngOnInit(): void {
    this.carregarTurmas();
    this.inicializarFormulario();
    // Sempre que o tipo de usuário mudar, atualize os validadores
    // (caso esteja usando two-way binding com ngModel, você também pode chamar o método via (ngModelChange))
    this.atualizarValidadores();
    console.log('Componente de cadastro de usuários carregado!');
  }

  /**
   * Inicializa o formulário com os controles.
   * Todos os campos são definidos, mas as validações serão ajustadas de acordo com o tipo selecionado.
   */
  private inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(11),
        Validators.maxLength(30)
      ]],
      senha: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) //Verifica se a senha tem digito, caracter especial, letra maiuscula e minuscula

      ]],
      cpf: ['', [
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]],
      // Campos específicos
      setor: [''],           // Administrador
      siape: [''],           // Administrador e Professor
      departamento: [''],    // Professor
      curso: ['']            // Aluno
    });
  }

  /**
   * Carrega as turmas disponíveis.
   */
  carregarTurmas(): void {
    this.turmaService.listarTodasTurmas({ page: 0, size: 10 }).subscribe({
      next: (res) => {
        this.turmasDisponiveis = res.content;
        console.log('Turmas carregadas:', res.content);
      },
      error: (err) => console.error('Erro ao carregar turmas:', err)
    });
  }

  /**
   * Atualiza os validadores dos controles de acordo com o tipo de usuário selecionado.
   */
  atualizarValidadores(): void {
    // Primeiro, limpe os validadores dos campos que não serão usados
    this.clearControlValidators('curso');
    this.clearControlValidators('setor');
    this.clearControlValidators('siape');
    this.clearControlValidators('departamento');

    if (this.tipoUsuarioSelecionado === 'administrador') {
      // Administrador: setor e siape são obrigatórios
      this.setControlValidators('setor', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]);
      this.setControlValidators('siape', [
        Validators.required,
        Validators.pattern(/^\d{7}$/)
      ]);
    } else if (this.tipoUsuarioSelecionado === 'professor') {
      // Professor: departamento e siape são obrigatórios
      this.setControlValidators('departamento', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]);
      this.setControlValidators('siape', [
        Validators.required,
        Validators.pattern(/^\d{7}$/)
      ]);
    } else if (this.tipoUsuarioSelecionado === 'aluno') {
      this.setControlValidators('curso', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]);
    }
  }

  /**
   * Método auxiliar para limpar validadores de um controle e atualizar seu estado.
   */
  private clearControlValidators(controlName: string): void {
    const control = this.usuarioForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  /**
   * Método auxiliar para definir validadores em um controle e atualizar seu estado.
   */
  private setControlValidators(controlName: string, validators: any[]): void {
    const control = this.usuarioForm.get(controlName);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  /**
   * Esse método deve ser chamado quando o tipo de usuário for alterado.
   */
  onTipoUsuarioChange(): void {
    console.log('Tipo de usuário alterado para:', this.tipoUsuarioSelecionado);
    this.atualizarValidadores();
  }

  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      Swal.fire({
        title: 'Erro!',
        text: 'Preencha todos os campos corretamente antes de enviar.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
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
          cpf: dadosUsuario.cpf,
          setor: dadosUsuario.setor,
          siape: dadosUsuario.siape,
          role: 'ROLE_ADMIN'
        });
        break;
  
      case 'professor':
        request = this.professorService.cadastrarProfessor({
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          cpf: dadosUsuario.cpf,
          departamento: dadosUsuario.departamento,
          siape: dadosUsuario.siape,
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
          role: 'ROLE_ALUNO'
        });
        break;
    }
  
    if (request) {
      request.subscribe({
        next: (res) => {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Usuário cadastrado com sucesso.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
  
          this.usuarioForm.reset();
          this.atualizarValidadores();
        },
        error: (err) => {
          Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível cadastrar o usuário. Tente novamente.',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Fechar'
          });
  
          console.error('Erro ao cadastrar usuário:', err);
        }
      });
    }
  }
}
