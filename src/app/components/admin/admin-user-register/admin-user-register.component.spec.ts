import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserRegisterComponent } from './admin-user-register.component';

describe('AdminUserRegisterComponent', () => {
  let component: AdminUserRegisterComponent;
  let fixture: ComponentFixture<AdminUserRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminUserRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
