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

  onSubmit(): void {
    // Limpa tokens e informações anteriores
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    if (!this.email || !this.senha) {
      console.error('❌ E-mail ou senha vazios!');
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    const credentials = { email: this.email, senha: this.senha };
    console.log('📨 Tentando fazer login com:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login realizado com sucesso:', response);
        // Processa a resposta do login (armazenamento de tokens, role, etc.)
        this.authService.handleLoginResponse(response);
        // Armazena o userId retornado (certifique-se de que response.usuario.id contém o valor correto)
        localStorage.setItem('userId', response.usuario.id.toString());
        setTimeout(() => {
          const role = this.authService.getUserRole();
          console.log('🔍 Role verificada após login:', role);
          // Redireciona para o board para alunos e professores; admin para '/admin'
          switch (role) {
            case 'ROLE_ADMINISTRADOR':
              this.router.navigate(['/admin']);
              break;
            case 'ROLE_PROFESSOR':
            case 'ROLE_ALUNO':
              this.router.navigate(['/board']);
              break;
            default:
              console.warn('⚠️ Role desconhecida, redirecionando para login...');
              this.router.navigate(['/login']);
          }
        }, 0);
      },
      error: (err) => {
        console.error('❌ Erro no login:', err);
        this.errorMessage = 'Erro no login. Verifique as credenciais.';
      }
    });
  }
}
