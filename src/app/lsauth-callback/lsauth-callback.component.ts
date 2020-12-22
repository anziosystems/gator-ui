import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService, DevDetails} from '../git-service';
import {LOCAL_STORAGE, WebStorageService, SESSION_STORAGE} from 'ngx-webstorage-service';
import {timer} from 'rxjs';

@Component({
  selector: 'app-lsauth-callback',
  templateUrl: './lsauth-callback.component.html',
  styleUrls: ['./lsauth-callback.component.less'],
})
export class LsauthCallbackComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private gitService: GitService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      const OrgToken = params['OrgToken'];
      if (OrgToken) {
        this.storage.set('OrgToken', OrgToken);
        console.log('[S] Token is set');
        //ignoring 404 of checkOrg here, as the first call is getting 404 but then this is called again in
        //Org-List by the RE-FILL-ORG-LIST Broadcast
        this.gitService.checkOrg();
        this.go();
      }
    });
  }

  ngOnInit(): void {}

  go() {
    this.gitService.getLoggedInUSerDetails(false).subscribe(r2 => {
      let dd = new DevDetails();
      dd.name = r2.DisplayName;
      dd.UserName = r2.UserName;
      dd.DisplayName = r2.DisplayName;
      dd.OrgDisplayName = r2.OrgDisplayName;
      dd.GitLogin = r2.GitUserName;
      dd.email = r2.Email;
      dd.Login = r2.UserName; //has email
      dd.image = r2.Photo;
      dd.id = r2.Id;
      dd.profileUrl = r2.profileUrl;
      dd.JiraUserName = r2.JiraUserName;
      dd.TfsUserName = r2.TfsUserName;
      this.gitService.setLoggedInDev(dd);
      this.gitService.broadcastGlobalComponentMessage('RE-FILL-ORG-LIST');

      this.router.navigate(['/dashboard']);
      return true;
    });
  }
}
