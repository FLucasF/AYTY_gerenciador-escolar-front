import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

    this.buildForm();
    this.loadUser();
  }

  buildForm(): void {
    this.editForm = this.fb.group({
      nome: [''],
      email: [''],
      senha: [''],
      ...(this.tipoUsuario === 'administrador' && {
        setor: [''],
        siape: ['']
      }),
      ...(this.tipoUsuario === 'professor' && {
        departamento: [''],
        siape: ['']
      }),
      ...(this.tipoUsuario === 'aluno' && {
        cpf: [''],
        curso: ['']
      })
    });
  }

  loadUser(): void {
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
          this.usuarioOriginal = usuario;
          this.editForm.patchValue(usuario);
        },
        error: (err) => console.error('❌ Erro ao carregar usuário:', err)
      });
    }
  }

  salvarEdicao(): void {
    if (this.editForm.invalid) {
      alert('Por favor, preencha os campos corretamente.');
      return;
    }

    // Monta um objeto com apenas os campos alterados
    const dadosAtualizados: any = {};
    Object.keys(this.editForm.value).forEach(key => {
      const novoValor = this.editForm.value[key];

      // Se o valor do campo mudou, adicionamos à requisição
      if (novoValor !== '' && novoValor !== this.usuarioOriginal[key]) {
        dadosAtualizados[key] = novoValor;
      } else {
        // Se o campo não foi alterado, mantém o valor original
        dadosAtualizados[key] = this.usuarioOriginal[key];
      }
    });

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
    this.router.navigate(['/admin']);
  }
}
