import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Importa o serviço de autenticação
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  role: string | null = null; // Inicializa a role do usuário como null

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole(); // Obtém a role do usuário autenticado
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redireciona para a tela de login
  }
}
