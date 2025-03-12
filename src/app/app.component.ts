import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private router: Router,
    private authService: AuthService) {}


  ngOnInit(): void {
    // Tenta restaurar a sessão automaticamente
    this.authService.initializeAuth().then((authenticated: boolean) => {
      if (authenticated) {
        console.log('Sessão restaurada com sucesso!');
      } else {
        console.warn('Sessão não restaurada. Redirecionando para login...');
        // Redirecionar para o login se a sessão não for restaurada
        this.router.navigate(['/login']);
      }
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
