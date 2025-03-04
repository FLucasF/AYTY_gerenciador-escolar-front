import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    console.log('🔍 Iniciando o login...');

    localStorage.clear(); // Limpa qualquer dado antes do login

    if (!this.email || !this.senha) {
      console.error('❌ E-mail ou senha vazios!');
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    const credentials = { email: this.email, senha: this.senha };

    try {
      const response = await this.authService.login(credentials).toPromise();
      console.log('✅ Login realizado com sucesso:', response);

      // Handle response from login
      this.authService.handleLoginResponse(response);

      // Verificando se o token foi armazenado corretamente
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔑 Token de acesso armazenado:', accessToken);

      // Redirecionando conforme o papel do usuário
      const role = this.authService.getUserRole();
      console.log('🔍 Role verificada após login:', role);

      if (!role) {
        console.error('❌ Role não encontrada após login.');
        return;
      }

      switch (role) {
        case 'ROLE_ADMIN':
          console.log('🔑 Redirecionando para Admin...');
          this.router.navigate(['/admin']);
          break;
        case 'ROLE_PROFESSOR':
        case 'ROLE_ALUNO':
          console.log('🔑 Redirecionando para Board...');
          this.router.navigate(['/board']);
          break;
        default:
          console.warn('⚠️ Role desconhecida, redirecionando para login...');
          this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      this.errorMessage = 'Erro no login. Verifique as credenciais.';
    }
  }
}
