import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { BoardComponent } from './components/board/board.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminUserRegisterComponent } from './components/admin/admin-user-register/admin-user-register.component';
import { AdminTurmasComponent } from './components/admin/admin-turmas/admin-turmas.component';
import { GerenciarAlunoTurmaComponent } from './components/admin/gerenciar-aluno-turma/gerenciar-aluno-turma.component';

import { AuthGuard } from './guards/auth.guard'; //protege rotas
import { RoleGuard } from './guards/role.guard'; //restringe acesso role

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'ROLE_ADMIN' },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'cadastro', component: AdminUserRegisterComponent },
      { path: 'turmas', component: AdminTurmasComponent },
      { path: 'turmas/:id/gerenciar-alunos', component: GerenciarAlunoTurmaComponent }
    ]
  },
  { path: 'board', component: BoardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
