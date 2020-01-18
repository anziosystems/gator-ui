import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BitbucketStatusComponent } from './bitbucket-status.component';

describe('BitbucketStatusComponent', () => {
  let component: BitbucketStatusComponent;
  let fixture: ComponentFixture<BitbucketStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BitbucketStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BitbucketStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
