import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    console.log('[AuthGuard] Verificando autenticação do usuário...');

    if (!this.authService.isLoggedIn()) {
      console.warn('[AuthGuard] ⚠️ Token inválido ou expirado. Redirecionando...');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('[AuthGuard] ✅ Acesso permitido.');
    return true;
  }
}
