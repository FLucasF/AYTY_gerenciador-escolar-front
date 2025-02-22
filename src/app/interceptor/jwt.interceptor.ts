// jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Não adiciona token para endpoints de autenticação
    if (req.url.includes('/auth/')) {
      return next.handle(req).pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('❌ Erro na requisição (sem token):', err);
          return throwError(() => err);
        })
      );
    }

    const token = localStorage.getItem('access_token');
    console.log('📡 Interceptando requisição para:', req.url, 'Token?', !!token);

    if (token) {
      req = req.clone({
        withCredentials: true, // Envia as credenciais junto com a requisição
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    } else {
      req = req.clone({
        withCredentials: true
      });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('❌ Erro na requisição:', err);
        return throwError(() => err);
      })
    );
  }
}
