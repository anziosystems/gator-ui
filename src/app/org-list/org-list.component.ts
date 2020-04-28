import {Component, OnInit, EventEmitter, Output, Inject, ɵReflectionCapabilities} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GitService} from '../git-service';
import {Route} from '@angular/compiler/src/core';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.less'],
})
export class OrgListComponent implements OnInit {
  orgList: any[];
  back_colors: string[];
  colors: string[];
  loggedIn: boolean;
  currentOrg: string;
  selectedOrg: string;
  constructor(
    private gitService: GitService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {
    this.gitService.onIsLoggedInEvent.subscribe(v => {
      this.loggedIn = v;
    });

    this.gitService.onGlobalComponentMessage.subscribe(message => {
      if (message === 'RE-FILL') {
        this.refill();
      }
    });
  }

  logout() {
    this.storage.remove('token');
    this.storage.remove('JiraToken');
    this.storage.remove('OrgToken');
    this.sessionStorage.remove('LOGGEDIN_USER');
    this.sessionStorage.remove('CURRENT-GIT-ORG');
    this.sessionStorage.remove('CURRENT-CONTEXT');
    this.sessionStorage.remove('LBC');
    this.router.navigate(['/login']);
  }

  gotoStatusReports() {
    this.gitService.setCurrentContext('GIT');
    this.router.navigate(['/StatusReport']);
  }

  gotoICReports() {
    this.gitService.setCurrentContext('GIT');
    this.router.navigate(['/icReport']);
  }

  gotoOrg() {
    this.gitService.setCurrentContext('GIT');
    this.router.navigate(['/orgChart']);
  }

  gotoOrgD() {
    this.gitService.setCurrentContext('GIT');
    this.router.navigate(['/od']);
  }

  data(org: any) {
    this.gitService.broadcastGlobalComponentMessage('HIDE_OD');
    //Keep the current Org in session, angular apps with refresh browser will reload the gitservice and application will forget everything
    if (org) {
      this.gitService.setCurrentGitOrg(org.Org);
      this.selectedOrg = org.Org;
    }
    this.router.onSameUrlNavigation = 'reload';
    this.router.initialNavigation();
    this.router.navigate(['/dashboard'], {
      queryParams: {Org: org.Org, refresh: new Date().getTime()},
    });
  }

  getMyStyle(val) {
    if (this.selectedOrg === val) {
      return {
        color: 'pink',
      };
    } else {
      return {
        color: 'white',
      };
    }
  }
  settings() {
    this.router.navigate(['/settings']);
  }

  ngOnInit() {
    this.refill();
  }

  refill() {
    this.orgList = [];
    //this.gitService.setCurrentGitOrg(this.route.snapshot.queryParamMap.get('Org'));
    this.gitService.getOrgList().subscribe(result => {
      //[{"TenantId":1040817,"Org":"LabShare","LastUpdated":"2019-04-30T10:25:25.150Z","DisplayName":"LabShare","Active":true},
      //{"TenantId":1040817,"Org":"anziosystems","LastUpdated":"2019-04-30T10:25:25.220Z","DisplayName":"Anzio Systems","Active":true},
      //{"TenantId":1040817,"Org":"ncats","LastUpdated":"2019-05-16T17:24:07.323Z","DisplayName":"National Center for Advancing Translational Sciences","Active":true},
      //{"TenantId":1040817,"Org":"Rafat-Sarosh","LastUpdated":"2019-05-16T17:24:07.950Z","DisplayName":"Rafat-Sarosh","Active":true}]

      //[{"Org":"axleinfo.com","DisplayName":"axleinfo.com","OrgType":"org       "},
      //{"Org":"LabShare","DisplayName":"LabShare","OrgType":"git       "}]
      this.orgList = result;
      this.sessionStorage.set('ORG-LIST', result);
      result.forEach(r => {
        if (r.OrgType === 'git') {
          this.gitService.setCurrentGitOrg(r.Org);
        }
        if (r.OrgType === 'org') {
          this.gitService.setCurrentOrg(r.Org);
        }
      });
    });
  }
}
