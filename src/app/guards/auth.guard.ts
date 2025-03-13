import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Verifica se o usuário está autenticado antes de permitir o acesso à rota.
   * 
   * Este método é chamado quando o usuário tenta acessar uma rota protegida. Ele verifica se o usuário está autenticado
   * com base na presença e validade do token de acesso. Caso o token seja válido, o acesso é permitido; caso contrário,
   * o usuário é redirecionado para a página de login.
   * 
   * @returns Observable<boolean> | Promise<boolean> | boolean - Retorna `true` se o usuário estiver autenticado, 
   * caso contrário, redireciona para a página de login e retorna `false`.
   */
  canActivate(
    // next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}