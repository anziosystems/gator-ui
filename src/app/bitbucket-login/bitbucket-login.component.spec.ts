import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BitbucketLoginComponent } from './bitbucket-login.component';

describe('BitbucketLoginComponent', () => {
  let component: BitbucketLoginComponent;
  let fixture: ComponentFixture<BitbucketLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BitbucketLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BitbucketLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
