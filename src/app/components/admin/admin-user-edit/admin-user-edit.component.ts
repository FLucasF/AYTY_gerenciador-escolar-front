import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdministradorService } from '../../../services/administrador.service';
import { ProfessorService } from '../../../services/professor.service';
import { AlunoService } from '../../../services/aluno.service';

@Component({
  selector: 'app-admin-user-edit',
  standalone: false,
  templateUrl: './admin-user-edit.component.html',
  styleUrls: ['./admin-user-edit.component.css']
})
export class AdminUserEditComponent implements OnInit {
  editForm!: FormGroup;
  usuarioId!: number;
  tipoUsuario!: 'administrador' | 'professor' | 'aluno';
  usuarioOriginal: any = {}; // Guarda os dados originais do usuário

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService
  ) {}

  ngOnInit(): void {
    this.usuarioId = Number(this.route.snapshot.params['id']);
    const tipoParam = this.route.snapshot.params['tipo'];
    this.tipoUsuario = tipoParam ? tipoParam.toLowerCase() as 'administrador' | 'professor' | 'aluno' : 'administrador';

    console.log("🔵 Inicializando edição de usuário...");
    console.log(`🆔 ID do usuário: ${this.usuarioId}, Tipo: ${this.tipoUsuario}`);

    this.inicializarFormulario();
    this.carregarUsuario();
  }

  /**
   * Inicializa o formulário com os campos dinâmicos.
   */
  private inicializarFormulario(): void {
    this.editForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(11), Validators.maxLength(30)]],
      senha: ['', [Validators.minLength(8), Validators.maxLength(20),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });

    this.adicionarCamposEspecificos();
  }

  /**
   * Adiciona campos dinâmicos ao formulário com base no tipo de usuário.
   */
  private adicionarCamposEspecificos(): void {
    if (this.tipoUsuario === 'administrador') {
      this.editForm.addControl('setor', this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'professor') {
      this.editForm.addControl('departamento', this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]));
      this.editForm.addControl('siape', this.fb.control('', [Validators.required, Validators.pattern(/^\d{7}$/)]));
    } else if (this.tipoUsuario === 'aluno') {
      this.editForm.addControl('curso', this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]));
    }

    console.log("✅ Campos adicionados dinamicamente:", Object.keys(this.editForm.controls));
  }

  /**
   * Carrega os dados do usuário e preenche o formulário.
   */
  private carregarUsuario(): void {
    let request: Observable<any> | null = null;

    switch (this.tipoUsuario) {
      case 'administrador':
        request = this.adminService.buscarAdministradorPorId(this.usuarioId);
        break;
      case 'professor':
        request = this.professorService.buscarProfessorPorId(this.usuarioId);
        break;
      case 'aluno':
        request = this.alunoService.buscarAlunoPorId(this.usuarioId);
        break;
    }

    if (request) {
      request.subscribe({
        next: (usuario) => {
          console.log("✅ Usuário carregado:", usuario);
          this.usuarioOriginal = usuario;

          // Ajustar os campos opcionais para undefined (removendo `null` ou `""`)
          Object.keys(usuario).forEach(key => {
            if (usuario[key] === '' || usuario[key] === null) usuario[key] = undefined;
          });

          this.editForm.patchValue(usuario);
        },
        error: (err) => console.error('❌ Erro ao carregar usuário:', err)
      });
    }
  }

  /**
   * Salva as alterações do usuário, enviando apenas os dados que foram alterados.
   */
  salvarEdicao(): void {
    if (this.editForm.invalid) {
      console.warn("⚠️ Formulário inválido:", this.editForm.value);
      alert('⚠️ Por favor, preencha os campos corretamente.');
      return;
    }
  
    // Criar um objeto completo mantendo os valores antigos se não forem alterados
    const dadosAtualizados = { ...this.usuarioOriginal, ...this.editForm.value };
  
    // Se a senha não foi alterada, manter a senha original
    if (!this.editForm.get('senha')?.dirty || !this.editForm.get('senha')?.value) {
      dadosAtualizados.senha = this.usuarioOriginal.senha;
    }
  
    console.log("📤 Dados enviados:", dadosAtualizados);
  
    let request: Observable<any> | null = null;
    switch (this.tipoUsuario) {
      case 'administrador':
        request = this.adminService.atualizarAdministrador(this.usuarioId, dadosAtualizados);
        break;
      case 'professor':
        request = this.professorService.atualizarProfessor(this.usuarioId, dadosAtualizados);
        break;
      case 'aluno':
        request = this.alunoService.atualizarAluno(this.usuarioId, dadosAtualizados);
        break;
    }
  
    if (request) {
      request.subscribe({
        next: () => {
          alert('✅ Usuário atualizado com sucesso!');
          this.router.navigate(['/admin']);
        },
        error: (err) => console.error('❌ Erro ao atualizar usuário:', err)
      });
    }
  }
  
  

  cancelar(): void {
    console.log("❌ Cancelando edição...");
    this.router.navigate(['/admin']);
  }
}
