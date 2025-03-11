import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    const clonedRequest = token 
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next.handle(clonedRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(clonedRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshTokenRequest().pipe(
      tap(response => {
        console.log("🔄 Token atualizado via interceptor!", response);
        this.authService.setSession(response.accessToken, response.userId, response.role);
        this.refreshTokenSubject.next(response.accessToken);
      }),
      switchMap(response => next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } }))),
      catchError(err => {
        console.error("❌ Falha ao renovar o token:", err);
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => err);
      }),
      tap(() => this.isRefreshing = false)
    );
  }
}
