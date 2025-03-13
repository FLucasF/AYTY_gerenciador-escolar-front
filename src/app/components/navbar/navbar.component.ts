import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  role: string | null = null;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  collapsed = true;
  
  constructor(private authService: AuthService, private router: Router) {}

   /**
   * Inicializa o componente e obtém o papel (role) do usuário.
   * 
   * O método é chamado assim que o componente é inicializado e carrega o papel do usuário
   * do serviço de autenticação.
   */
  ngOnInit(): void {
    this.role = this.authService.getUserRole();
  }

  /**
   * Alterna o estado do menu lateral (sidenav) entre aberto e fechado.
   * 
   * Este método verifica se o sidenav está disponível e alterna seu estado atual (aberto/fechado).
   */
  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  /**
   * Realiza o logout do usuário e redireciona para a página de login.
   * 
   * O método exibe uma caixa de diálogo (Swal) perguntando se o usuário tem certeza de que
   * deseja sair. Caso o usuário confirme, o serviço de logout é chamado e o usuário é redirecionado
   * para a tela de login.
   */
  logout(): void {
    Swal.fire({
      title: 'Tem certeza que deseja sair?',
      text: 'Você precisará fazer login novamente para acessar sua conta.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        Swal.fire({
          title: 'Sessão encerrada!',
          text: 'Você saiu do sistema com sucesso.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}