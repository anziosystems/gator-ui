import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LsauthComponent } from './lsauth.component';

describe('LsauthComponent', () => {
  let component: LsauthComponent;
  let fixture: ComponentFixture<LsauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LsauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LsauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
