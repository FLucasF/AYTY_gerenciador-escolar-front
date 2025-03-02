// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';  // <-- Adicione essa linha
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminUserRegisterComponent } from './components/admin/admin-user-register/admin-user-register.component';
import { BoardComponent } from './components/board/board.component';
import { AdminTurmasComponent } from './components/admin/admin-turmas/admin-turmas.component';

import { JwtInterceptor } from './interceptor/jwt.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { AdminUserEditComponent } from './components/admin/admin-user-edit/admin-user-edit.component';
import { GerenciarAlunoTurmaComponent } from './components/admin/gerenciar-aluno-turma/gerenciar-aluno-turma.component';
import { NavbarComponent } from './components/navbar/navbar.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    AdminUserRegisterComponent,
    BoardComponent,
    AdminTurmasComponent,
    AdminUserEditComponent,
    GerenciarAlunoTurmaComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatListModule,  // Adicione esta linha
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,  // Para a barra superior
    MatButtonModule,   // Para botões
    MatIconModule,     // Para os ícones do Material
    MatSidenavModule,  // Para o menu lateral responsivo
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
