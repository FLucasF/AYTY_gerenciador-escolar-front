import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const token = localStorage.getItem('token');
    if (!token) {
      // Se não houver token, redireciona para login
      return this.router.parseUrl('/login');
    }
    // Aqui você pode incluir lógica para decodificar o token e checar a expiração
    return true;
  }
}
