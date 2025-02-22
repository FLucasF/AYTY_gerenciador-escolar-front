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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdministradorService,
    private professorService: ProfessorService,
    private alunoService: AlunoService
  ) { }

  ngOnInit(): void {
    console.log("🔎 Route params:", this.route.snapshot.params);
    this.usuarioId = Number(this.route.snapshot.params['id']);
    const tipoParam = this.route.snapshot.params['tipo'];
    this.tipoUsuario = tipoParam ? tipoParam.toLowerCase() as 'administrador' | 'professor' | 'aluno' : 'administrador';
    console.log(`🚀 Editando ${this.tipoUsuario} com ID: ${this.usuarioId}`);
    
    this.buildForm();
    this.loadUser();
  }

  buildForm(): void {
    // Controles comuns
    this.editForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['']
    });
    // Controles específicos
    if (this.tipoUsuario === 'administrador') {
      this.editForm.addControl('setor', this.fb.control('', Validators.required));
      this.editForm.addControl('siape', this.fb.control('', Validators.required));
    } else if (this.tipoUsuario === 'professor') {
      this.editForm.addControl('departamento', this.fb.control('', Validators.required));
      this.editForm.addControl('siape', this.fb.control('', Validators.required));
    } else if (this.tipoUsuario === 'aluno') {
      this.editForm.addControl('cpf', this.fb.control('', Validators.required));
      this.editForm.addControl('curso', this.fb.control('', Validators.required));
    }
    console.log('🛠️ Formulário construído:', this.editForm.value);
  }

  loadUser(): void {
    let request: Observable<any> | null = null;
    if (this.tipoUsuario === 'administrador') {
      request = this.adminService.buscarAdministradorPorId(this.usuarioId);
    } else if (this.tipoUsuario === 'professor') {
      request = this.professorService.buscarProfessorPorId(this.usuarioId);
    } else if (this.tipoUsuario === 'aluno') {
      request = this.alunoService.buscarAlunoPorId(this.usuarioId);
    }
    if (request) {
      request.subscribe({
        next: (usuario: any) => {
          console.log('✅ Dados do usuário recebidos:', usuario);
          this.editForm.patchValue({
            nome: usuario.nome,
            email: usuario.email,
            senha: '',
            setor: usuario.setor,
            siape: usuario.siape,
            departamento: usuario.departamento,
            cpf: usuario.cpf,
            curso: usuario.curso
          });
          console.log('📝 Formulário preenchido:', this.editForm.value);
        },
        error: (err) => console.error('❌ Erro ao carregar usuário:', err)
      });
    }
  }

  salvarEdicao(): void {
    if (this.editForm.invalid) {
      alert('Por favor, preencha os campos obrigatórios corretamente.');
      return;
    }
    const dados = this.editForm.value;
    console.log('📤 Dados a serem enviados:', dados);
    let request: Observable<any> | null = null;
    if (this.tipoUsuario === 'administrador') {
      request = this.adminService.atualizarAdministrador(this.usuarioId, dados);
    } else if (this.tipoUsuario === 'professor') {
      request = this.professorService.atualizarProfessor(this.usuarioId, dados);
    } else if (this.tipoUsuario === 'aluno') {
      request = this.alunoService.atualizarAluno(this.usuarioId, dados);
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
    this.router.navigate(['/admin']);
  }
}
