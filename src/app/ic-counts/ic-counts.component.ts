import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';
import {Router, NavigationEnd} from '@angular/router';
import {stringify} from 'querystring';

@Component({
  selector: 'app-ic-counts',
  templateUrl: './ic-counts.component.html',
  styleUrls: ['./ic-counts.component.less'],
})
export class IcCountsComponent implements OnInit {
  count: number = 0;
  todayCount: number = 0;
  weekCount: number = 0;
  closeCount: number = 0;
  allTimeOpenCount: number = 0;
  allTimeCloseCount: number = 0;
  todayCloseCount: number = 0;
  weekCloseCount: number = 0;
  navigationSubscription: any;
  login: string;
  NintyOpenCount: number = 0;
  NintyCloseCount: number = 0;

  constructor(private gitService: GitService, private router: Router) {
    this.count = 0;
    this.closeCount = 0;

    this.todayCount = 0;
    this.todayCloseCount = 0;

    this.weekCount = 0;
    this.weekCloseCount = 0;

    this.NintyOpenCount = 0;
    this.NintyCloseCount = 0;

    this.allTimeOpenCount = 0;
    this.allTimeCloseCount = 0;

    //Keep this in constuctor
    this.gitService.onDevLoginIdChanged.subscribe(val => {
      this.getPRCount(val.GitLogin);
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  data(action: string, day: number) {
    this.gitService.broadcastStringValue(action + '+' + day.toString());
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
  }

  //0: {state: "closed", ctr: 27}
  // {state: "commit", ctr: 16}
  // {state: "open", ctr: 30}

  assignValues(val: any, day: number) {
    let ctr: number = 0;
    let cctr: number = 0;

    if (val[0]) {
      if (val[0].state.toLowerCase() === 'closed') {
        cctr = val[0].ctr;
      } else {
        if (val[0].state.toLowerCase() === 'open') {
          ctr = val[0].ctr;
        }
      }
    }
    if (val[1]) {
      if (val[1].state.toLowerCase() === 'closed') {
        cctr = cctr + val[1].ctr;
      }
      if (val[1].state.toLowerCase() === 'open') {
        ctr = val[1].ctr;
      }
    }

    if (val[2]) {
      if (val[2].state.toLowerCase() === 'open') {
        ctr = val[2].ctr;
      }
      if (val[2].state.toLowerCase() === 'closed') {
        cctr = val[2].ctr;
      }
    }

    if (day === 1) {
      this.todayCount = ctr;
      this.todayCloseCount = cctr;
    }
    if (day === 7) {
      this.weekCount = ctr;
      this.weekCloseCount = cctr;
    }
    if (day === 30) {
      this.count = ctr;
      this.closeCount = cctr;
    }
    if (day === 999) {
      this.allTimeOpenCount = ctr;
      this.allTimeCloseCount = cctr;
    }
    //
    if (day === 90) {
      this.NintyOpenCount = ctr;
      this.NintyCloseCount = cctr;
    }
  }

  initializeData() {
    this.todayCount = 0;
    this.todayCloseCount = 0;
    this.weekCount = 0;
    this.weekCloseCount = 0;
    this.count = 0;
    this.closeCount = 0;
    this.allTimeOpenCount = 0;
    this.allTimeCloseCount = 0;
    this.NintyOpenCount = 0;
    this.NintyCloseCount = 0;
  }

  getPRCount(login: string) {
    this.count = 0;
    this.closeCount = 0;

    this.todayCount = 0;
    this.todayCloseCount = 0;

    this.weekCount = 0;
    this.weekCloseCount = 0;

    this.NintyOpenCount = 0;
    this.NintyCloseCount = 0;

    this.allTimeOpenCount = 0;
    this.allTimeCloseCount = 0;

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentGitOrg(), login, 1).subscribe(val => {
        this.assignValues(val, 1);
      });
    });

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentGitOrg(), login, 7).subscribe(val => {
        this.assignValues(val, 7);
      });
    });

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentGitOrg(), login, 30).subscribe(val => {
        this.assignValues(val, 30);
      });
    });

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentGitOrg(), login, 90).subscribe(val => {
        this.assignValues(val, 90);
      });
    });

    // this.gitService.ready().then(result => {
    //   this.gitService.getPullRequestCount(this.gitService.getCurrentOrg(), login, 999).subscribe(val => {
    //     this.assignValues(val, 999);
    //   });
    // });
  }

  ngOnInit() {
    this.initializeData();
  }
}
