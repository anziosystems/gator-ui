import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BitbucketCallBackComponent} from './bitbucket-call-back.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
describe('BitbucketCallBackComponent', () => {
  let component: BitbucketCallBackComponent;
  let fixture: ComponentFixture<BitbucketCallBackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [BitbucketCallBackComponent],
    }).compileComponents();
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
