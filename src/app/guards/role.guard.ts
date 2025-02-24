import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getUserRole()?.toUpperCase(); // Padronizando role

    console.log('🔎 Verificando acesso:', expectedRole, 'Obtido:', userRole);

    if (!userRole || userRole !== expectedRole) {
      console.warn('🚫 Acesso negado! Redirecionando...');
      this.router.navigate(['/board']);
      return false;
    }
    return true;
  }
}
