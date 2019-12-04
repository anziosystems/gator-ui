import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraStatusComponent } from './jira-status.component';

describe('JiraStatusComponent', () => {
  let component: JiraStatusComponent;
  let fixture: ComponentFixture<JiraStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JiraStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
