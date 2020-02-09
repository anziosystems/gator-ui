import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcReportComponent } from './ic-report.component';

describe('IcReportComponent', () => {
  let component: IcReportComponent;
  let fixture: ComponentFixture<IcReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
