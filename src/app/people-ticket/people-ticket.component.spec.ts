import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleTicketComponent } from './people-ticket.component';

describe('PeopleTicketComponent', () => {
  let component: PeopleTicketComponent;
  let fixture: ComponentFixture<PeopleTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
