import { Component } from '@angular/core';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Administrador } from '../../../models/administrador.model';
import { Professor } from '../../../models/professor.model';
import { Aluno } from '../../../models/aluno.model';
import { Observable } from 'rxjs';

/**
 * Tipo usado apenas para o formulário de cadastro.
 * Ele reúne todas as propriedades necessárias como strings.
 */
interface UsuarioForm {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  setor: string;
  departamento: string;
  curso: string;
}

@Component({
  selector: 'app-admin-user-register',
  standalone: false,
  templateUrl: './admin-user-register.component.html',
  styleUrls: ['./admin-user-register.component.css'],
})
export class AdminUserRegisterComponent {
  tipoUsuarioSelecionado: 'administrador' | 'professor' | 'aluno' = 'administrador';

  // Usamos o tipo UsuarioForm para armazenar os dados do formulário.
  usuario: UsuarioForm = {
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    setor: '',
    departamento: '',
    curso: ''
  };
  
  constructor(private usuarioService: UsuarioService) {}

  salvarUsuario() {
    let request: Observable<Administrador | Professor | Aluno> | null = null;
  
    // Monta o objeto de envio conforme o tipo selecionado
    switch (this.tipoUsuarioSelecionado) {
      case 'administrador':
        request = this.usuarioService.cadastrarAdministrador({
          nome: this.usuario.nome,
          email: this.usuario.email,
          senha: this.usuario.senha,
          setor: this.usuario.setor,
          // Se o modelo Administrador não espera cpf, ignore-o
          tipo: 'administrador'
        });
        break;
      case 'professor':
        request = this.usuarioService.cadastrarProfessor({
          nome: this.usuario.nome,
          email: this.usuario.email,
          senha: this.usuario.senha,
          departamento: this.usuario.departamento,
          // Se o modelo Professor não espera cpf, ignore-o
          tipo: 'professor'
        });
        break;
      case 'aluno':
        request = this.usuarioService.cadastrarAluno({
          nome: this.usuario.nome,
          email: this.usuario.email,
          senha: this.usuario.senha,
          cpf: this.usuario.cpf,
          curso: this.usuario.curso,
          tipo: 'aluno'
        });
        break;
      default:
        console.error('Tipo de usuário inválido');
        return;
    }
  
    if (request) {
      request.subscribe({
        next: (res) => {
          console.log('Usuário cadastrado com sucesso!', res);
          this.resetarFormulario();
        },
        error: (err: any) => {
          console.error('Erro ao cadastrar usuário:', err);
        }
      });
    }
  }
  
  resetarFormulario() {
    this.usuario = { nome: '', email: '', senha: '', cpf: '', setor: '', departamento: '', curso: '' };
  }
}
