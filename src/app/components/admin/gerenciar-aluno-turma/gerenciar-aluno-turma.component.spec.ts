import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarAlunoTurmaComponent } from './gerenciar-aluno-turma.component';

describe('GerenciarAlunoTurmaComponent', () => {
  let component: GerenciarAlunoTurmaComponent;
  let fixture: ComponentFixture<GerenciarAlunoTurmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GerenciarAlunoTurmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciarAlunoTurmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
