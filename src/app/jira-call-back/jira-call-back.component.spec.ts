import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraCallBackComponent } from './jira-call-back.component';

describe('JiraCallBackComponent', () => {
  let component: JiraCallBackComponent;
  let fixture: ComponentFixture<JiraCallBackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraCallBackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraCallBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
