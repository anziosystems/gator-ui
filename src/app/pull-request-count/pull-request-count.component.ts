import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug, isNullOrUndefined} from 'util';
import {Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-pull-request-count',
  templateUrl: './pull-request-count.component.html',
  styleUrls: ['./pull-request-count.component.less'],
})
export class PullRequestCountComponent implements OnInit {
  count: number = 0;
  todayCount: number = 0;
  weekCount: number = 0;
  closeCount: number = 0;
  todayCloseCount: number = 0;
  weekCloseCount: number = 0;
  navigationSubscription: any;

  constructor(private gitService: GitService, private router: Router) {
    this.count = 0;
    this.todayCount = 0;
    this.weekCount = 0;
    this.todayCloseCount = 0;

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
    this.gitService.trigger(action + '+' + day.toString());
  }

  initializeData() {
    this.todayCount = 0;
    this.todayCloseCount = 0;
    this.weekCount = 0;
    this.weekCloseCount = 0;
    this.count = 0;
    this.closeCount = 0;

    this.gitService.Ready().then(result => {
      console.log('Ready Done: ' + this.gitService.currentOrg);
      this.gitService.GetPullRequestCount(this.gitService.currentOrg, 1).subscribe(val => {
            if (val[1]) {
              this.todayCount = val[1].ctr;
            }
            if (val[0]) {
              this.todayCloseCount = val[0].ctr;
            }
      });
    });

    this.gitService.Ready().then(result => {
      this.gitService.GetPullRequestCount(this.gitService.currentOrg, 7).subscribe(val => {
        if (val[1]) {
          this.weekCount = val[1].ctr;
        }
        if (val[0]) {
          this.weekCloseCount = val[0].ctr;
        }
      });
    });

    this.gitService.Ready().then(result => {
      this.gitService.GetPullRequestCount(this.gitService.currentOrg, 30).subscribe(val => {
        if (val[1]) {
          this.count = val[1].ctr;
        }
        if (val[0]) {
          this.closeCount = val[0].ctr;
        }
      });
    });
  }
  ngOnInit() {
    this.initializeData();
  }
}
