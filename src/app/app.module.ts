import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminUserRegisterComponent } from './components/admin/admin-user-register/admin-user-register.component';
import { LoginComponent } from './components/login/login.component';  // ✅ Adicionado
import { BoardComponent } from './components/board/board.component';  // ✅ Adicionado
import { UsuarioService } from './services/usuario/usuario.service';
import { AdminTurmasComponent } from './components/admin/admin-turmas/admin-turmas.component';
import { JwtInterceptor } from '../app/interceptor/jwt.interceptor';  // ✅ Adicionado

@NgModule({
  declarations: [
    AppComponent,
    AdminDashboardComponent,
    AdminUserRegisterComponent,
    LoginComponent,  // ✅ Adicionado
    BoardComponent, AdminTurmasComponent   // ✅ Adicionado
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    UsuarioService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
