import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HydrateComponent } from './hydrate.component';

describe('HydrateComponent', () => {
  let component: HydrateComponent;
  let fixture: ComponentFixture<HydrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HydrateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HydrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
