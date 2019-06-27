import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HookErrorComponent } from './hook-error.component';

describe('HookErrorComponent', () => {
  let component: HookErrorComponent;
  let fixture: ComponentFixture<HookErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HookErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HookErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
