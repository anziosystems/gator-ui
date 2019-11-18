import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevJiraDetailsComponent } from './dev-jira-details.component';

describe('DevJiraDetailsComponent', () => {
  let component: DevJiraDetailsComponent;
  let fixture: ComponentFixture<DevJiraDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevJiraDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevJiraDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
