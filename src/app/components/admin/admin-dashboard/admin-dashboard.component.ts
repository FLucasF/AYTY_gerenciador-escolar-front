import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import { AlunoService } from '../../../services/aluno.service';
import { ProfessorService } from '../../../services/professor.service';
import { AdministradorService } from '../../../services/administrador.service';
import { Page } from '../../../models/page.model';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  usuarios: any[] = [];
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  editForm!: FormGroup;
  usuarioEditando: any = null;
  usuarioOriginal: any = {};
  tipoUsuario!: 'administrador' | 'professor' | 'aluno';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private alunoService: AlunoService,
    private professorService: ProfessorService,
    private administradorService: AdministradorService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.carregarUsuarios();
    this.inicializarFormulario();
  }

  carregarUsuarios(event?: PageEvent): void {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    this.usuarioService.listarUsuarios(this.pageIndex, this.pageSize).subscribe({
      next: (res: Page<any>) => {
        console.log("Dados recebidos do backend:", res);

        this.usuarios = res.content.map(user => ({
          ...user,
          tipo: this.definirTipo(user.role),
          informacaoExtra: this.obterInformacaoExtra(user)
        }));

        this.pageIndex = res.page.number;
        this.pageSize = res.page.size;
        this.totalElements = res.page.totalElements;
      },
      error: (err) => console.error('Erro ao carregar usuarios:', err)
    });
  }

  excluirUsuario(usuario: any): void {
    Swal.fire({
      title: `Tem certeza que deseja excluir ${usuario.nome}?`,
      text: "Essa ação não pode ser desfeita!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let request$: Observable<any>;
        switch (usuario.tipo) {
          case 'aluno': request$ = this.alunoService.excluirAluno(usuario.id); break;
          case 'professor': request$ = this.professorService.excluirProfessor(usuario.id); break;
          case 'administrador': request$ = this.administradorService.excluirAdministrador(usuario.id); break;
          default: console.error('Erro: Tipo de usuário desconhecido'); return;
        }

        request$.subscribe({
          next: () => {
            Swal.fire({
              title: 'Excluído!',
              text: `${usuario.nome} foi removido com sucesso.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            });
            this.carregarUsuarios();
          },
          error: (err) => console.error(`Erro ao excluir ${usuario.tipo}:`, err),
        });
      }
    });
  }

  irParaEdicao(usuario: any): void {
    console.log("Iniciando edição para usuário:", usuario);

    if (this.usuarioEditando?.id === usuario.id) {
      console.log("Usuário ja carregado, evitando requisição extra");
      this.editForm.patchValue(this.usuarioEditando);
      return;
    }

    this.usuarioEditando = usuario;
    this.tipoUsuario = usuario.tipo as 'administrador' | 'professor' | 'aluno';

    this.inicializarFormulario();
    this.adicionarCamposEspecificos();

    let request: Observable<any> | null = null;

    switch (this.tipoUsuario) {
      case 'administrador':
        request = this.administradorService.buscarAdministradorPorId(usuario.id);
        break;
      case 'professor':
        request = this.professorService.buscarProfessorPorId(usuario.id);
        break;
      case 'aluno':
        request = this.alunoService.buscarAlunoPorId(usuario.id);
        break;
    }

    if (request) {
      request.subscribe({
        next: (dados) => {
          console.log("Dados completos do usurio carregados:", dados);
          this.usuarioEditando = dados;
          this.editForm.patchValue(dados);
        },
        error: (err) => console.error('Erro ao carregar dados do usuario:', err)
      });
    }
  }

  salvarEdicao(): void {
    if (this.editForm.invalid) {
      Swal.fire({
        title: 'Erro!',
        text: 'Preencha os campos corretamente antes de salvar.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Confirmar edição?',
      text: 'Deseja salvar as alterações neste usuário?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, salvar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const dadosAtualizados = { ...this.usuarioOriginal, ...this.editForm.value };


        console.log("📤 Enviando dados para atualização...");
        console.log("➡️ ID do usuário:", this.usuarioEditando.id);
        console.log("➡️ Nome:", dadosAtualizados.nome);
        console.log("➡️ Email:", dadosAtualizados.email);
        console.log("➡️ CPF:", dadosAtualizados.cpf);
        console.log("➡️ Tipo:", this.tipoUsuario);

        
        let request: Observable<any> | null = null;
        switch (this.tipoUsuario) {
          case 'administrador':
            request = this.administradorService.atualizarAdministrador(this.usuarioEditando.id, dadosAtualizados);
            break;
          case 'professor':
            request = this.professorService.atualizarProfessor(this.usuarioEditando.id, dadosAtualizados);
            break;
          case 'aluno':
            request = this.alunoService.atualizarAluno(this.usuarioEditando.id, dadosAtualizados);
            break;
        }

        if (request) {
          request.subscribe({
            next: () => {
              Swal.fire({
                title: 'Sucesso!',
                text: 'Usuário atualizado com sucesso!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
              });
              this.usuarioEditando = null;
              this.carregarUsuarios();
            },
            error: (err) => console.error('Erro ao atualizar usuário:', err)
          });
        }
      }
    });
  }

  cancelarEdicao(): void {
    Swal.fire({
      title: 'Cancelar edição?',
      text: 'As alterações feitas não serão salvas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, cancelar!',
      cancelButtonText: 'Continuar editando'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioEditando = null;
      }
    });
  }

  inicializarFormulario(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      senha: ['', [
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]]
    });
  } 

  definirTipo(role: string): string {
    console.log(`Convertendo role "${role}" para tipo...`);
    if (role === 'ALUNO' || role === 'ROLE_ALUNO') {
      return 'aluno';
    } else if (role === 'PROFESSOR' || role === 'ROLE_PROFESSOR') {
      return 'professor';
    } else if (role === 'ADMINISTRADOR' || role === 'ROLE_ADMIN') {
      return 'administrador';
    } else {
      return 'desconhecido';
    }
  }

  obterInformacaoExtra(user: any): string {
    if (user.tipo === 'aluno') {
      return `Curso: ${user.curso || 'Não informado'}`;
    }
    if (user.tipo === 'professor') {
      return `Departamento: ${user.departamento || 'Não informado'}`;
    }
    if (user.tipo === 'administrador') {
      return `Setor: ${user.setor || 'Não informado'}`;
    }
    return 'Não disponível';
  }

  private adicionarCamposEspecificos(): void {
    if (this.editForm.contains('setor')) { this.editForm.removeControl('setor'); }
    if (this.editForm.contains('siape')) { this.editForm.removeControl('siape'); }
    if (this.editForm.contains('departamento')) { this.editForm.removeControl('departamento'); }
    if (this.editForm.contains('curso')) { this.editForm.removeControl('curso'); }

    if (this.tipoUsuario === 'administrador') {
      this.editForm.addControl('setor', this.fb.control('', [Validators.required]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'professor') {
      this.editForm.addControl('departamento', this.fb.control('', [Validators.required]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'aluno') {
      this.editForm.addControl('curso', this.fb.control('', [Validators.required]));
    }
  }

  mudarPagina(event: PageEvent): void {
    console.log(`Mudando para página: ${event.pageIndex}`);
    this.carregarUsuarios(event);
  }

  irParaCadastro(): void {
    console.log("Redirecionando para cadastro de usuario");
    this.router.navigate(['/admin/cadastro']);
  }
}
