import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // Certifique-se de que o arquivo CSS está no mesmo diretório
})
export class LoginComponent {
  email: string = '';
  senha: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    // Cria o objeto de credenciais
    const credentials = { email: this.email, senha: this.senha };
    console.log('Tentando fazer login com:', credentials);

    // Requisição POST para o endpoint de login
    this.http.post<any>('http://localhost:8090/auth/login', credentials)
      .subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso:', response);
          // Armazena token e role
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          // Redireciona para o dashboard (ou outra rota protegida)
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Erro no login:', err);
          this.errorMessage = 'Erro no login. Verifique as credenciais.';
        }
      });
  }
}
