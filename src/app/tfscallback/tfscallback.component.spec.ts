import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TfscallbackComponent } from './tfscallback.component';

describe('TfscallbackComponent', () => {
  let component: TfscallbackComponent;
  let fixture: ComponentFixture<TfscallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TfscallbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TfscallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
