import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BitbucketCallBackComponent } from './bitbucket-call-back.component';

describe('BitbucketCallBackComponent', () => {
  let component: BitbucketCallBackComponent;
  let fixture: ComponentFixture<BitbucketCallBackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BitbucketCallBackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BitbucketCallBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
