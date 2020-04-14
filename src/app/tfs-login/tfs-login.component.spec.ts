import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TfsLoginComponent } from './tfs-login.component';

describe('TfsLoginComponent', () => {
  let component: TfsLoginComponent;
  let fixture: ComponentFixture<TfsLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TfsLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TfsLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
