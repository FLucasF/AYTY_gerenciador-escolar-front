// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['expectedRole']; // Por exemplo, 'ROLE_ADMINISTRADOR'
    const userRole = this.authService.getUserRole();
    console.log('🔎 Verificando acesso: Esperado:', expectedRole, 'Obtido:', userRole);
    if (!userRole || userRole !== expectedRole) {
      console.warn('🚫 Acesso negado! Redirecionando para login...');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
