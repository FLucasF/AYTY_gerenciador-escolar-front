import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthenticationResponse } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';

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
    console.log('[LoginComponent] Iniciando login...');

    if (!this.email || !this.senha) {
      console.error('[LoginComponent] Campos não preenchidos');
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    const credentials = { email: this.email, senha: this.senha };
    console.log('[LoginComponent] Credenciais enviadas:', credentials);

    try {
      await lastValueFrom(this.authService.login(credentials));
      console.log('[LoginComponent] Login realizado com sucesso!');

      // Aguarda um pequeno delay para garantir que o back-end já definiu o cookie do refresh token
      setTimeout(() => {
        const role = this.authService.getUserRole();
        console.log('[LoginComponent] Role obtida após login:', role);

        if (!role) {
          console.error('[LoginComponent] ❌ Não foi possível obter a role após login.');
          this.errorMessage = 'Problema ao identificar sua conta.';
          return;
        }

        switch (role) {
          case 'ROLE_ADMIN':
            console.log('[LoginComponent] Redirecionando para painel ADMIN.');
            this.router.navigate(['/admin']);
            break;
          case 'ROLE_PROFESSOR':
          case 'ROLE_ALUNO':
            console.log('[LoginComponent] Redirecionando para BOARD.');
            this.router.navigate(['/board']);
            break;
          default:
            console.warn('[LoginComponent] Role desconhecida, voltando ao login.');
            this.router.navigate(['/login']);
        }
      }, 1000);
    } catch (error: any) {
      console.error('[LoginComponent] Erro no login:', error);
      this.errorMessage = error.error?.message || 'Credenciais inválidas!';
    }
  }
}
