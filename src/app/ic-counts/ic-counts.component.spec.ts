import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcCountsComponent } from './ic-counts.component';

describe('IcCountsComponent', () => {
  let component: IcCountsComponent;
  let fixture: ComponentFixture<IcCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
