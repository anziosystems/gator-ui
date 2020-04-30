import {Component, OnInit, Inject} from '@angular/core';
import {GitService, DevDetails} from '../git-service';
import {Router} from '@angular/router';
import {LOCAL_STORAGE, WebStorageService, SESSION_STORAGE} from 'ngx-webstorage-service';

@Component({
  selector: 'app-lsauth-status',
  templateUrl: './lsauth-status.component.html',
  styleUrls: ['./lsauth-status.component.less'],
})
export class LsauthStatusComponent implements OnInit {
  hookStatus: boolean = false;
  orgStatus: boolean = false;
  repoStatus: boolean = false;
  prStatus: boolean = false;
  repoCount: number = 0;
  orgList: any;
  messages: string[];
  successMessages: string[];
  errMessages: string[];
  warningMessages: string[];
  progress: string[];
  buttonDisabled: boolean = true;
  hookFail: boolean = true;
  ctr = 0;
  bgate = false;
  _timer: any;
  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {
    this.loginAndSetup();
  }

  async loginAndSetup() {
    //Get Org Details

    this.messages = [];
    this.errMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.progress = [];
    this.bgate = false;
    let statusbarWidth = 1;
    this._timer = setInterval(() => {
      let elem = document.getElementById('myBar');
      statusbarWidth = statusbarWidth + 1;
      if (statusbarWidth < 100) {
        elem.style.width = statusbarWidth + '%';
        const token = this.storage.get('OrgToken');
        if (token) {
          if (!this.bgate) {
            this.go();
          }
        }
      } else {
        this.buttonDisabled = false;
        clearTimeout(this._timer);
      }
    }, 200); //every 200 ms
  }

  go() {
    this.bgate = true;
    this.successMessages.push(`Checking few things...`);
    this.gitService.getLoggedInUSerDetails(false).subscribe(r2 => {
      this.successMessages.push(`Getting user details ...`);
      let dd = new DevDetails();
      dd.name = r2.UserDisplayName;
      dd.login = r2.UserName;
      dd.image = r2.Photo;
      dd.id = r2.Id;
      dd.profileUrl = r2.profileUrl;
      // let buff = btoa(JSON.stringify(dd));
      this.gitService.setLoggedInGitDev(dd);
      this.successMessages.push(`Found ${r2.UserDisplayName}`);
      this.gitService.getOrgList().subscribe(result => {
        this.sessionStorage.set('ORG-LIST', result);
        if (result.length > 0) {
          this.successMessages.push(`Found organization!!`);
        }
        result.forEach(r => {
          if (r.OrgType === 'git') {
            this.gitService.setCurrentGitOrg(r.Org);
          }
          if (r.OrgType === 'org') {
            this.gitService.setCurrentOrg(r.Org);
          }
        });
        this.successMessages.push(`Done!`);
        this.buttonDisabled = false;

        let elem = document.getElementById('myBar');
        elem.style.width = '100%';
        clearTimeout(this._timer);
        this.gitService.broadcastGlobalComponentMessage('RE-FILL');
      });
    });
  }

  ngOnInit(): void {}
  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      //window.location.reload();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
