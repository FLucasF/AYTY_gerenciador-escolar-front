import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs'; //, throwError, BehaviorSubject
// import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // private isRefreshing = false;
  // private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  /**
   * Intercepta a requisição HTTP e adiciona o token de autorização (JWT) no cabeçalho da requisição.
   * 
   * Este método é chamado automaticamente para todas as requisições HTTP. Ele verifica se há um token JWT
   * armazenado e, se existir, o adiciona no cabeçalho da requisição sob a chave `Authorization` com o valor 
   * `Bearer <token>`.
   * 
   * @param req - A requisição HTTP original a ser interceptada e manipulada.
   * @param next - O manipulador de requisição para passar a requisição para o próximo interceptor ou para a execução final.
   * @returns Observable<HttpEvent<any>> - Retorna um Observable que emite o evento HTTP com o cabeçalho de autorização adicionado.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req);
  }
}