import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraLoginInComponent } from './jira-login-in.component';

describe('JiraLoginInComponent', () => {
  let component: JiraLoginInComponent;
  let fixture: ComponentFixture<JiraLoginInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraLoginInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraLoginInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
