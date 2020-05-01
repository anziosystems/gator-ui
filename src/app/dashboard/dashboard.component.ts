import {Component, OnInit, Inject} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {ChangeDetectionStrategy, Input} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
/* Imports for Stateful Component */
import {ChangeDetectorRef, forwardRef, Optional, SkipSelf, ApplicationRef} from '@angular/core';

/* Import defaults for LeftNavComponent State */

export const STATE = () => {
  /* Get defaults for leftNav's leftBar */

  return {
    items: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
    sectionItems: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
    currentOrg: null,
  };
};
export const PROPS = {};

type PaneType = 'left' | 'right';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'], // changeDetection: ChangeDetectionStrategy.OnPush,
  // animations: [
  //   trigger('slide', [
  //     state('hide', style({ transform: 'translateX(-100%)' })),
  //     state('show', style({ transform: 'translateX(0)' })),
  //     transition('* => *', animate(300))
  // ])]
})
export class DashboardComponent implements OnInit {
  orgs: any;
  isShowDetail: boolean = false;
  isJiraShowDetail: boolean = false;
  isShowOD: boolean = false;
  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    /* For Stateful Components */
    inj: ChangeDetectorRef,

    public appRef: ApplicationRef,
  ) {
    setInterval(() => {
      location.reload();
    }, 6000000); //every 100 min
  }

  ngOnInit() {
    let token = this.storage.get('OrgToken');
    if (!token) {
      //TO: goto right login
      this.router.navigate(['/lsauth']);
      return;
    }
    this.gitService.checkOrg().then ( x => {
      if (x === '404') {
        this.router.navigate(['/lsauth']); //May be right login
      }
    });
    
    this.gitService.triggerIsLoggedIn(true);

    // //Jira
    // let jiratoken = this.storage.get('JiraToken');
    // if (!jiratoken) {
    //   this.router.navigate(['/jira-login']);
    // }

    this.gitService.onGlobalComponentMessage.subscribe((val: string) => {
      if (val === 'CLOSE_PULL_DETAILS') {
        this.isShowDetail = false;
      }
      if (val === 'SHOW_PULL_DETAILS') {
        this.isShowDetail = true;
        this.isJiraShowDetail = false;
      }

      if (val === 'CLOSE_JIRA_DETAILS') {
        this.isJiraShowDetail = false;
      }
      if (val === 'SHOW_JIRA_DETAILS') {
        this.isJiraShowDetail = true;
        this.isShowDetail = false;
      }

      if (val === 'SHOW_OD') {
        this.isShowOD = true;
      }
      if (val === 'HIDE_OD') {
        this.isShowOD = false;
      }
    });
  }

  gitData() {
    this.gitService.setCurrentContext('GIT');
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    //this.gitService.trigger(this.gitService.getCurrentDev().login);
    this.gitService.broadcastDevLoginId (this.gitService.getCurrentDev());
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
  }

  jiraData() {
    const date = new Date();
    this.gitService.setCurrentContext('JIRA');
    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //
    if (!this.storage.get('JiraToken')) {
      this.router.navigate(['/jira-login']);
      return;
    }
    // else {
    //   //Delete this else clause
    //   this.router.navigate(['/jiraStatus']);

    // }
    this.gitService.triggerJira(this.gitService.getCurrentDev().name);
    this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
  }

  onStatefulInit() {
    // let token = this.storage.get('token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    // }
    // //Jira
    // let jiratoken = this.storage.get('JiraToken');
    // if (!jiratoken) {
    //   this.router.navigate(['/jira-login']);
    // }
  }

  /* TODO: Remove once diff feature implemented in NgxStateful */
  prevState = STATE();
  currState = STATE();
}
