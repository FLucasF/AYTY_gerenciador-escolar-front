import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  tipoUsuarioSelecionado: 'todos' | 'administrador' | 'professor' | 'aluno' = 'todos';
  usuarios: any[] = [];

  // Paginação
  totalPages: number = 0;
  currentPage: number = 0;
  size: number = 10;

  constructor(
    private usuarioService: UsuarioService,
    private alunoService: AlunoService,
    private professorService: ProfessorService,
    private administradorService: AdministradorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("🔵 Inicializando AdminDashboard...");
    this.carregarUsuarios();
  }

  carregarUsuarios(page: number = 0): void {
    this.currentPage = page;
    console.log(`📥 Carregando usuários - Página: ${page}`);
    this.usuarioService.listarUsuarios(page, this.size).subscribe({
      next: (res: Page<any>) => {
        console.log("✅ Usuários recebidos do backend:", res);
        this.usuarios = res.content.map(user => ({
          ...user,
          tipo: this.definirTipo(user.role)
        }));
        console.log("🔎 Usuários após conversão de role para tipo:", this.usuarios);
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
    } else if (role === 'ADMINISTRADOR' || role === 'ROLE_ADMINISTRADOR') {
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
      let request$;
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

  irParaEdicao(usuario: any): void {
    console.log("✏️ Redirecionando para edição do usuário:", usuario);
    // Verifica se o usuário possui "id" (ou outra propriedade como _id)
    const id = usuario.id || usuario._id;
    if (!id) {
      console.error("❌ ID do usuário não encontrado:", usuario);
      return;
    }
    console.log("🔎 ID do usuário para edição:", id);
    this.router.navigate([`/admin/editar/${usuario.tipo}/${id}`]);
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
}
