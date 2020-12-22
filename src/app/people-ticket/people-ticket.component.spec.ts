import {HttpClientTestingModule} from '@angular/common/http/testing';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng';

import {PeopleTicketComponent} from './people-ticket.component';

describe('PeopleTicketComponent', () => {
  let component: PeopleTicketComponent;
  let fixture: ComponentFixture<PeopleTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [PeopleTicketComponent],
      providers: [
        DynamicDialogRef,
        {
          provide: DynamicDialogConfig,
          useValue: {
            data: {
              options: [],
            },
          },
        },
      ],
    }).compileComponents();
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
