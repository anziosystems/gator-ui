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
    this.gitService.broadcastComponentMessage('SHOW_PULL_DETAILS');
  }

  //0: {state: "closed", ctr: 27}
  // {state: "commit", ctr: 16}
  // {state: "open", ctr: 30}
   
  assignValues (val: any, day: number) {
    let ctr: number = 0 
    let cctr: number = 0;

    if (val[0]) {
      if (val[0].state === 'closed') {
        cctr = val[0].ctr ;
      } else {
        if (val[0].state === 'commit') { //sometime there is no close only commit
        //  cctr =  val[0].ctr ;
        } else {
          ctr = val[0].ctr ; //must be only open then 
        }
      }
    }
    if (val[1]) {
      if (val[1].state === 'commit') {
      //  cctr =  cctr + val[1].ctr ;
      } else {
        if (val[1].state === 'close') {
           cctr =  cctr + val[1].ctr ;
        } else {
          ctr = val[1].ctr ; //must be only open then 
        }
      }
    }

    if (val[2]) {
      if (val[2].state === 'open') {
        ctr = val[2].ctr ;
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

  }

  initializeData() {
    this.todayCount = 0;
    this.todayCloseCount = 0;
    this.weekCount = 0;
    this.weekCloseCount = 0;
    this.count = 0;
    this.closeCount = 0;

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentOrg(), 1).subscribe(val => {
        this.assignValues (val,1) ;    
      });
    });

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentOrg(), 7).subscribe(val => {
        this.assignValues (val,7) ;
      });
    });

    this.gitService.ready().then(result => {
      this.gitService.getPullRequestCount(this.gitService.getCurrentOrg(), 30).subscribe(val => {
        this.assignValues (val, 30) ;
    });
  });
}

ngOnInit() {
    this.initializeData();
  }
}
