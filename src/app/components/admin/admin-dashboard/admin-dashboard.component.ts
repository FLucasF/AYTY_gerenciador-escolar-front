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

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  // Variáveis de listagem, filtro e paginação
  tipoUsuarioSelecionado: 'todos' | 'administrador' | 'professor' | 'aluno' = 'todos';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = []; // Lista que será exibida no HTML
  pageIndex: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  // Variáveis para edição via modal
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
    this.inicializarFormulario();
  }

  /**
   * Carrega os usuários com paginação
   */
  carregarUsuarios(event?: PageEvent): void {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }

    this.usuarioService.listarUsuarios(this.pageIndex, this.pageSize).subscribe({
      next: (res: Page<any>) => {
        console.log("📥 Dados recebidos do backend:", res);

        this.usuarios = res.content.map(user => ({
          ...user,
          tipo: this.definirTipo(user.role),
          informacaoExtra: this.obterInformacaoExtra(user)
        }));

        this.pageIndex = res.page.number;
        this.pageSize = res.page.size;
        this.totalElements = res.page.totalElements;

        this.filtrarUsuarios();
      },
      error: (err) => console.error('❌ Erro ao carregar usuários:', err)
    });
  }


  irParaCadastro(): void {
    console.log("➕ Redirecionando para cadastro de usuário...");
    this.router.navigate(['/admin/cadastro']);
  }

  excluirUsuario(usuario: any): void {
    if (confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) {
      let request$: Observable<any>;
      switch (usuario.tipo) {
        case 'aluno': request$ = this.alunoService.excluirAluno(usuario.id); break;
        case 'professor': request$ = this.professorService.excluirProfessor(usuario.id); break;
        case 'administrador': request$ = this.administradorService.excluirAdministrador(usuario.id); break;
        default: console.error('❌ Erro: Tipo de usuário desconhecido.'); return;
      }

      request$.subscribe({
        next: () => {
          console.log(`✅ Usuário ${usuario.nome} excluído com sucesso!`);
          this.carregarUsuarios();
        },
        error: (err) => console.error(`❌ Erro ao excluir ${usuario.tipo}:`, err),
      });
    }
  }

  irParaEdicao(usuario: any): void {
    console.log("✏️ Iniciando edição para usuário:", usuario);

    if (this.usuarioEditando?.id === usuario.id) {
      console.log("🔄 Usuário já carregado, evitando requisição extra.");
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
          console.log("✅ Dados completos do usuário carregados:", dados);
          this.usuarioEditando = dados;
          this.editForm.patchValue(dados);
        },
        error: (err) => console.error('❌ Erro ao carregar dados do usuário:', err)
      });
    }
  }

  salvarEdicao(): void {
    if (this.editForm.invalid) {
      console.warn("⚠️ Formulário inválido:", this.editForm.value);
      alert('⚠️ Por favor, preencha os campos corretamente.');
      return;
    }

    const dadosAtualizados = { ...this.usuarioOriginal, ...this.editForm.value };

    if (!this.editForm.get('senha')?.dirty || !this.editForm.get('senha')?.value) {
      dadosAtualizados.senha = this.usuarioOriginal.senha;
    }

    console.log("📤 Dados enviados:", dadosAtualizados);

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
          alert('✅ Usuário atualizado com sucesso!');
          this.usuarioEditando = null;
          this.carregarUsuarios();
        },
        error: (err) => console.error('❌ Erro ao atualizar usuário:', err)
      });
    }
  }

  cancelarEdicao(): void {
    console.log("❌ Cancelando edição...");
    this.usuarioEditando = null;
  }

  /**
   * Adiciona os campos específicos do usuário no formulário.
   */
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
    console.log(`📜 Mudando para página: ${event.pageIndex}`);
    this.carregarUsuarios(event);
  }

  inicializarFormulario(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
  }


  filtrarUsuarios(): void {
    console.log(`📊 Filtrando usuários - Tipo selecionado: ${this.tipoUsuarioSelecionado}`);
    
    if (this.tipoUsuarioSelecionado === 'todos') {
        this.usuariosFiltrados = [...this.usuarios];
    } else {
        this.usuariosFiltrados = this.usuarios.filter(user => user.tipo === this.tipoUsuarioSelecionado);
    }

    console.log("🔎 Usuários filtrados:", this.usuariosFiltrados);
}

definirTipo(role: string): string {
  console.log(`🔄 Convertendo role "${role}" para tipo...`);
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

}
