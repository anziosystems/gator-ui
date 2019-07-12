import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrchartComponent } from './prchart.component';

describe('PrchartComponent', () => {
  let component: PrchartComponent;
  let fixture: ComponentFixture<PrchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
