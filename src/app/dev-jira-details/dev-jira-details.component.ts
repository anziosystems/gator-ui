import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';
import {UsageService} from '@labshare/ngx-core-services';
import {getLocaleDateTimeFormat} from '@angular/common';

@Component({
  selector: 'app-dev-jira-details',
  templateUrl: './dev-jira-details.component.html',
  styleUrls: ['./dev-jira-details.component.less'],
})
export class DevJiraDetailsComponent implements OnInit {
  devDetails: any[];
  developer: string;
  navigationSubscription: any;
  bHideDetails: boolean = true;
  constructor(private gitService: GitService, private router: Router, private usageService: UsageService) {
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

  closePane() {
    this.gitService.broadcastComponentMessage('CLOSE_JIRA_DETAILS');
    this.bHideDetails = true;
  }

  initializeData() {
    let x = Date.now.toString();
    //  this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});

    this.devDetails = [];
    this.developer = '';

    this.gitService.ready().then(result => {
      this.gitService.onJiraEvent.subscribe((val: string) => {
        if (val.lastIndexOf('+') > 0) {
          const arr = _.split(val, '+');
          this.getDeveloperDetails(arr[0]);
        }
      });
    });
  }

  getDeveloperDetails(developer: string) {
    this.gitService.ready().then(result => {
      this.gitService.getJiraTickets(this.gitService.jiraCurrentOrg, developer, 50).subscribe(val => {
        this.devDetails = val;
        // this.devDetails.map(v => {
        //   let s = v.pullrequesturl;
        //   s = s.replace('https://api.github.com/repos', 'https://github.com');
        //   s = s.replace('pulls', 'pull');
        //   s = s.replace('comments', ' ');
        //   v.pullrequesturl = s;
        //   v.body = v.body.replace(/\+/g,' ');
        //   v.title = v.title.replace(/\+/g,' ');
        // });
      });
    });
  }

  ngOnInit() {
    this.initializeData();
  }
}
