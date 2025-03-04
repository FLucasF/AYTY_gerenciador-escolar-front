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
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("🔵 Inicializando AdminDashboard...");
    this.carregarUsuarios();
    this.inicializarFormulario(); // Inicializa o formulário para o modal de edição
  }

  carregarUsuarios(page: number = 0): void {
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
        console.log("🔎 Usuários processados:", this.usuarios);
        this.totalPages = res.totalPages;
      },
      error: (err: any) => console.error('❌ Erro ao carregar usuários:', err),
    });
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

  filtrarUsuarios(): any[] {
    console.log(`📊 Filtrando usuários - Tipo selecionado: ${this.tipoUsuarioSelecionado}`);
    const filtrados = this.tipoUsuarioSelecionado === 'todos'
      ? this.usuarios
      : this.usuarios.filter(user => user.tipo === this.tipoUsuarioSelecionado);
    console.log("🔎 Usuários filtrados:", filtrados);
    return filtrados;
  }

  excluirUsuario(usuario: any): void {
    console.log("🗑️ Excluindo usuário:", usuario);
    if (confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) {
      let request$: Observable<any>;
      switch (usuario.tipo) {
        case 'aluno':
          request$ = this.alunoService.excluirAluno(usuario.id);
          break;
        case 'professor':
          request$ = this.professorService.excluirProfessor(usuario.id);
          break;
        case 'administrador':
          request$ = this.administradorService.excluirAdministrador(usuario.id);
          break;
        default:
          console.error('❌ Erro: Tipo de usuário desconhecido.');
          return;
      }
      request$.subscribe({
        next: () => {
          console.log(`✅ Usuário ${usuario.nome} excluído com sucesso!`);
          this.carregarUsuarios(this.currentPage);
        },
        error: (err: any) => console.error(`❌ Erro ao excluir ${usuario.tipo}:`, err),
      });
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

  // Abre o modal de edição: busca os dados completos do usuário e configura o formulário
  irParaEdicao(usuario: any): void {
    console.log("✏️ Iniciando edição para usuário:", usuario);
    this.usuarioEditando = usuario;
    // Aqui definimos a propriedade tipoUsuario com o tipo do usuário que está sendo editado
    this.tipoUsuario = usuario.tipo as 'administrador' | 'professor' | 'aluno';
    // Reinicia o formulário e adiciona os campos específicos conforme o tipo
    this.inicializarFormulario();
    this.adicionarCamposEspecificos();

    // Carrega os dados completos do usuário via serviço, similar ao componente antigo
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
          // Salva os dados originais para futuras comparações
          this.usuarioOriginal = dados;
          // Ajusta valores opcionais para undefined, se necessário
          Object.keys(dados).forEach(key => {
            if (dados[key] === '' || dados[key] === null) { 
              dados[key] = undefined;
            }
          });
          // Preenche o formulário com os dados carregados
          this.editForm.patchValue(dados);
        },
        error: (err) => console.error('❌ Erro ao carregar dados do usuário:', err)
      });
    }
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

  // Envia os dados atualizados do formulário para o backend
  salvarEdicao(): void {
    if (this.editForm.invalid) {
      console.warn("⚠️ Formulário inválido:", this.editForm.value);
      alert('⚠️ Por favor, preencha os campos corretamente.');
      return;
    }

    // Cria um objeto mesclando os dados originais com as alterações feitas
    const dadosAtualizados = { ...this.usuarioOriginal, ...this.editForm.value };

    // Se a senha não foi alterada, mantém o valor original
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
          this.usuarioEditando = null; // Fecha o modal
          this.carregarUsuarios(this.currentPage); // Atualiza a listagem
        },
        error: (err) => console.error('❌ Erro ao atualizar usuário:', err)
      });
    }
  }

  cancelarEdicao(): void {
    console.log("❌ Cancelando edição...");
    this.usuarioEditando = null;
  }
}
