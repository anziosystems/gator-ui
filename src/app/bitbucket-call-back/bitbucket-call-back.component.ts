import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {timer} from 'rxjs';

@Component({
  selector: 'app-bitbucket-call-back',
  templateUrl: './bitbucket-call-back.component.html',
  styleUrls: ['./bitbucket-call-back.component.less'],
})
export class BitbucketCallBackComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private gitService: GitService, private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      const BitBucketToken = params['BitBucket'];
      if (BitBucketToken) {
        this.gitService.setJiraToken (BitBucketToken);
        this.storage.set('BitBucket', BitBucketToken);
        this.gitService.broadcastComponentMessage('SHOW_BITBUCKET_DETAILS');
        this.router.navigate(['/bitbucketStatus']);
      }
    });
  }
  ngOnInit() {}
}
