import {Component, OnInit, EventEmitter, Output, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GitService} from '../git-service';
import {Route} from '@angular/compiler/src/core';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';

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
  ) {}

  logout() {
    this.storage.remove('token');
    this.storage.remove('JiraToken');
    this.sessionStorage.remove('LOGGEDIN_USER');
    this.sessionStorage.remove('CURRENT-ORG');
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

  data(org: any) {
    //Keep the current Org in session, angular apps with refresh browser will reload the gitservice and application will forget everything
    if (org) {
      this.gitService.setCurrentOrg(org.Org);
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
    this.orgList = [];
    this.gitService.setCurrentOrg(this.route.snapshot.queryParamMap.get('Org'));
    this.gitService.getOrgList().subscribe(result => {
      this.orgList = result;
    });
  }
}
