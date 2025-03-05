import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/auth/')) {
      return next.handle(req).pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro na requisição (sem token):', err);
          return throwError(() => err);
        })
      );
    }

    const token = localStorage.getItem('accessToken');
    console.log('Interceptando requisição para:', req.url, 'Token?', !!token);

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Erro na requisição:', err);
        return throwError(() => err);
      })
    );
  }
}
