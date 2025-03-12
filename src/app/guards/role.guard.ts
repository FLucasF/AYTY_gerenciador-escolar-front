import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verifica se o usuário está autenticado (token presente e não expirado)
    if (!this.authService.isLoggedIn()) {
      console.error('Usuário não autenticado ou token expirado, redirecionando para login');
      this.router.navigate(['/login']);
      return false;
    }
    
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getUserRole();
    const userId = this.authService.getUserId();

    if (!userRole || !userId || userId === 0) {
      console.error('Role ou ID do usuário inválidos, redirecionando');
      this.router.navigate(['/login']);
      return false;
    }
  
    if (userRole !== expectedRole) {
      console.error(`Acesso negado! Esperava ${expectedRole}, mas encontrou ${userRole}`);
      this.router.navigate(['/login']);
      return false;
    }
  
    console.log('Acesso permitido para:', userRole);
    return true;
  }
}