import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import { AlunoService } from '../../../services/aluno.service';
import { ProfessorService } from '../../../services/professor.service';
import { AdministradorService } from '../../../services/administrador.service';
import { Page } from '../../../models/page.model';

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
  totalPages: number = 0;
  currentPage: number = 0;
  size: number = 10;
  usuariosFiltrados: any[] = []; // Lista que será exibida no HTML


  // Variáveis para edição via modal
  editForm!: FormGroup;
  usuarioEditando: any = null; // Armazena o usuário que está sendo editado
  usuarioOriginal: any = {}; // Guarda os dados originais do usuário

  // Propriedade adicionada para capturar o tipo do usuário na edição
  tipoUsuario!: 'administrador' | 'professor' | 'aluno';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private alunoService: AlunoService,
    private professorService: ProfessorService,
    private administradorService: AdministradorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log("🔵 Inicializando AdminDashboard...");
    this.carregarUsuarios();
    this.inicializarFormulario(); // Inicializa o formulário para o modal de edição
  }

  carregarUsuarios(page: number = 0, forcarAtualizacao: boolean = false): void {
    if (this.usuarios.length > 0 && !forcarAtualizacao) {
        console.log("⚠️ Evitando requisição extra, usuários já carregados.");
        return;
    }

    this.currentPage = page;
    console.log(`📥 Carregando usuários - Página: ${page}`);

    this.usuarioService.listarUsuarios(page, this.size).subscribe({
        next: (res: Page<any>) => {
            console.log("✅ Usuários recebidos do backend:", res.content);
            this.usuarios = res.content.map(user => ({
                ...user,
                tipo: this.definirTipo(user.role),
                informacaoExtra: this.obterInformacaoExtra(user)
            }));
            this.totalPages = res.totalPages;

            // Atualiza a lista filtrada após carregar os usuários
            this.filtrarUsuarios();
        },
        error: (err: any) => console.error('❌ Erro ao carregar usuários:', err),
    });
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
                this.carregarUsuarios(this.currentPage, true);
            },
            error: (err: any) => console.error(`❌ Erro ao excluir ${usuario.tipo}:`, err),
        });
    }
}

irParaEdicao(usuario: any): void {
    if (this.usuarioEditando?.id === usuario.id) {
        console.log("🔄 Usuário já carregado, evitando requisição extra.");
        this.editForm.patchValue(this.usuarioEditando);
        return;
    }

    this.usuarioEditando = usuario;
    this.tipoUsuario = usuario.tipo;
    this.inicializarFormulario();
    this.adicionarCamposEspecificos();

    let request: Observable<any> | null = null;
    switch (this.tipoUsuario) {
        case 'administrador': request = this.administradorService.buscarAdministradorPorId(usuario.id); break;
        case 'professor': request = this.professorService.buscarProfessorPorId(usuario.id); break;
        case 'aluno': request = this.alunoService.buscarAlunoPorId(usuario.id); break;
    }

    if (request) {
        request.subscribe({
            next: (dados) => {
                this.usuarioEditando = dados;
                this.editForm.patchValue(dados);
            },
            error: (err) => console.error('❌ Erro ao carregar dados do usuário:', err)
        });
    }
}

salvarEdicao(): void {
    if (this.editForm.invalid) return;

    const dadosAtualizados = { ...this.usuarioOriginal, ...this.editForm.value };

    let request$: Observable<any> | null = null;
    switch (this.tipoUsuario) {
        case 'administrador': request$ = this.administradorService.atualizarAdministrador(this.usuarioEditando.id, dadosAtualizados); break;
        case 'professor': request$ = this.professorService.atualizarProfessor(this.usuarioEditando.id, dadosAtualizados); break;
        case 'aluno': request$ = this.alunoService.atualizarAluno(this.usuarioEditando.id, dadosAtualizados); break;
    }

    if (request$) {
        request$.subscribe({
            next: () => {
                console.log('✅ Usuário atualizado com sucesso!');
                this.usuarioEditando = null;
                this.carregarUsuarios(this.currentPage, true);
            },
            error: (err) => console.error('❌ Erro ao atualizar usuário:', err)
        });
    }
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



  filtrarUsuarios(): void {
      console.log(`📊 Filtrando usuários - Tipo selecionado: ${this.tipoUsuarioSelecionado}`);
      
      if (this.tipoUsuarioSelecionado === 'todos') {
          this.usuariosFiltrados = [...this.usuarios];
      } else {
          this.usuariosFiltrados = this.usuarios.filter(user => user.tipo === this.tipoUsuarioSelecionado);
      }
  
      console.log("🔎 Usuários filtrados:", this.usuariosFiltrados);
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

  irParaCadastro(): void {
    console.log("➕ Redirecionando para cadastro de usuário...");
    this.router.navigate(['/admin/cadastro']);
  }

  mudarPagina(page: number): void {
    console.log(`📜 Mudando para página: ${page}`);
    if (page < 0 || page >= this.totalPages) {
      console.warn("⚠️ Tentativa de acessar página inválida!");
      return;
    }
    this.carregarUsuarios(page);
  }

  // Inicializa o formulário com os campos comuns
  private inicializarFormulario(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(11), Validators.maxLength(30)]],
      senha: ['', [Validators.minLength(8), Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
  }

  // Adiciona os campos específicos de acordo com o tipo do usuário que está sendo editado
  private adicionarCamposEspecificos(): void {
    // Se os controles já existirem, remove-os para evitar duplicação
    if (this.editForm.contains('setor')) { this.editForm.removeControl('setor'); }
    if (this.editForm.contains('siape')) { this.editForm.removeControl('siape'); }
    if (this.editForm.contains('departamento')) { this.editForm.removeControl('departamento'); }
    if (this.editForm.contains('curso')) { this.editForm.removeControl('curso'); }

    if (this.tipoUsuario === 'administrador') {
      this.editForm.addControl('setor', this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'professor') {
      this.editForm.addControl('departamento', this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'aluno') {
      this.editForm.addControl('curso', this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]));
    }
    console.log("✅ Campos do formulário:", Object.keys(this.editForm.controls));
  }


  cancelarEdicao(): void {
    console.log("❌ Cancelando edição...");
    this.usuarioEditando = null;
  }
}
