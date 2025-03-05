import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  senha: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    console.log('Iniciando o login...');
  
    localStorage.clear();
  
    if (!this.email || !this.senha) {
      console.error('E-mail ou senha vazios!');
      Swal.fire({
        title: 'Atenção!',
        text: 'Preencha todos os campos antes de continuar.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    const credentials = { email: this.email, senha: this.senha };
  
    try {
      // Substituição do toPromise() por lastValueFrom()
      const response = await lastValueFrom(this.authService.login(credentials));
      console.log('Login realizado com sucesso:', response);
  
      this.authService.handleLoginResponse(response);
  
      const accessToken = localStorage.getItem('accessToken');
      console.log('Token de acesso armazenado:', accessToken);
  
      const role = this.authService.getUserRole();
      console.log('Role verificada após login:', role);
  
      if (!role) {
        console.error('Role não encontrada após login.');
        Swal.fire({
          title: 'Erro!',
          text: 'Parece que houve um problema ao identificar sua conta. Tente novamente!',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      setTimeout(() => {
        switch (role) {
          case 'ROLE_ADMIN':
            console.log('Redirecionando para Admin.');
            this.router.navigate(['/admin']);
            break;
          case 'ROLE_PROFESSOR':
          case 'ROLE_ALUNO':
            console.log('Redirecionando para Board.');
            this.router.navigate(['/board']);
            break;
          default:
            console.warn('Role desconhecida, redirecionando para login.');
            this.router.navigate(['/login']);
        }
      }, 500);
  
    } catch (error) {
      console.error('Erro no login:', error);
      Swal.fire({
        title: 'Erro no login!',
        text: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Tentar novamente'
      });
    }
  }
  
}
