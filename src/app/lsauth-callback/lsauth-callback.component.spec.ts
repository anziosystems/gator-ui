import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LsauthCallbackComponent } from './lsauth-callback.component';

describe('LsauthCallbackComponent', () => {
  let component: LsauthCallbackComponent;
  let fixture: ComponentFixture<LsauthCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LsauthCallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LsauthCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
