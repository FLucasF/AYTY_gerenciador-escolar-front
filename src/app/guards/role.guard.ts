import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router, private jwtHelper: JwtHelperService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('[RoleGuard] Verificando role.');

    let userRole = localStorage.getItem('role');
    const expectedRole = route.data['expectedRole'];

    console.log('[RoleGuard] Usuário tem role:', userRole);
    console.log('[RoleGuard] Role esperada:', expectedRole);

    if (!userRole) {
      console.warn('[RoleGuard] Role não encontrada no localStorage. Tentando recuperar do token.');
    
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decoded = this.jwtHelper.decodeToken(token);
          if (decoded?.role) {
            userRole = decoded.role.toUpperCase();
            if (userRole) {
              localStorage.setItem('role', userRole);
            }
            console.log('[RoleGuard] Role recuperada do token:', userRole);
          }
        } catch (error) {
          console.error('[RoleGuard] Erro ao decodificar token:', error);
        }
      }
    }

    if (!userRole) {
      console.error('[RoleGuard] Nenhuma role encontrada! Redirecionando para login.');
      this.router.navigate(['/login']);
      return false;
    }

    if (userRole !== expectedRole) {
      console.error(`[RoleGuard] Acesso negado! esperava ${expectedRole}, mas encontrou ${userRole}`);
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
