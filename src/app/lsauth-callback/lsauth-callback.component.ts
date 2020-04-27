import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {timer} from 'rxjs';

@Component({
  selector: 'app-lsauth-callback',
  templateUrl: './lsauth-callback.component.html',
  styleUrls: ['./lsauth-callback.component.less'],
})
export class LsauthCallbackComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private gitService: GitService, private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      const OrgToken = params['OrgToken'];
      if (OrgToken) {
        this.gitService.setJiraToken(OrgToken);
        this.storage.set('OrgToken', OrgToken);
        // this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit(): void {}
}
