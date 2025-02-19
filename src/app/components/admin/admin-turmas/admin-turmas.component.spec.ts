import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTurmasComponent } from './admin-turmas.component';

describe('AdminTurmasComponent', () => {
  let component: AdminTurmasComponent;
  let fixture: ComponentFixture<AdminTurmasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminTurmasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTurmasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
