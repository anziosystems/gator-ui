import {Component, OnInit, Inject} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
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
  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    /* For Stateful Components */
    inj: ChangeDetectorRef,

    public appRef: ApplicationRef,
  ) {
    setInterval(() => {
      location.reload();
    }, 6000000); //every 100 min
  }

  ngOnInit() {
    this.gitService.onComponentMessage.subscribe((val: string) => {
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
    });
  }

  onStatefulInit() {
    let token = this.storage.get('token');
    if (!token) {
      this.router.navigate(['/login']);
    }

    //Jira
    let jiratoken = this.storage.get('JiraToken');
    if (!jiratoken) {
      this.router.navigate(['/jira-login']);
    }
  }

  /* TODO: Remove once diff feature implemented in NgxStateful */
  prevState = STATE();
  currState = STATE();
}
