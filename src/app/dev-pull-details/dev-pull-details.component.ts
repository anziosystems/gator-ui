import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, CustomEvent} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';
// import {UsageService} from '@labshare/ngx-core-services';
import {getLocaleDateTimeFormat} from '@angular/common';

@Component({
  selector: 'app-dev-pull-details',
  templateUrl: './dev-pull-details.component.html',
  styleUrls: ['./dev-pull-details.component.less'],
})
export class DevPullDetailsComponent implements OnInit {
  devDetails: any[];
  developer: string;
  navigationSubscription: any;
  bHideDetails: boolean = true;
  bShowName = false;
  DEFAULT_DAYS = 100;
  bShowAddButton: boolean = false;

  constructor(
    private gitService: GitService,
    private router: Router, // private usageService: UsageService
  ) {
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
    this.gitService.broadcastComponentMessage('CLOSE_PULL_DETAILS');
    this.bHideDetails = true;
  }

  initializeData() {
    this.gitService.onCustomEvent.subscribe((val: CustomEvent) => {
      if (val.source === 'STATUS-REPORT' && val.destination === 'TOP-DEVELOPER') {
        this.bShowAddButton = true;
      }
    });

    let x = Date.now.toString();
    //  this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});

    this.devDetails = [];
    this.developer = '';
    this.bShowName = false;
    this.gitService.ready().then(result => {
      this.gitService.onMyEvent.subscribe((val: string) => {
        if (val === undefined) {
          console.log('subscription event returned undefined. Exiting');
          return;
        }
        if (val.lastIndexOf('+') > 0) {
          const arr = _.split(val, '+');
          this.getActionDetails(arr[0], Number(arr[1]));
          this.bShowName = true;
        } else {
          if (val.startsWith('repo-')) {
            this.bShowName = true;
            const arr = _.split(val, 'repo-');
            this.gitService.getRepositoryPR(this.gitService.currentOrg, this.DEFAULT_DAYS, arr[1], 50).subscribe(val => {
              this.devDetails = val;
              this.devDetails.map(v => {
                let s = v.pullrequesturl;
                s = s.replace('https://api.github.com/repos', 'https://github.com');
                s = s.replace('pulls', 'pull');
                s = s.replace('comments', ' ');
                v.pullrequesturl = s;
                v.body = v.body.replace(/\+/g, ' ');
                v.title = v.title.replace(/\+/g, ' ');
              });
            });
          } else {
            this.bShowName = false;
            this.getDeveloperDetails(val);
          }
        }
      });
    });
  }

  getDeveloperDetails(developer: string) {
    this.gitService.ready().then(result => {
      this.gitService.getDeveloperDetail(this.gitService.currentOrg, this.DEFAULT_DAYS, developer, 'null', 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
          v.body = v.body.replace(/\+/g, ' ');
          v.title = v.title.replace(/\+/g, ' ');
        });
      });
    });
  }

  addGitPR(dev: any) {
    this.gitService.triggerCustomEvent({
      source: 'GIT',
      destination: 'STATUS-REPORT',
      message: `${dev.title}  Created at: ${dev.created_at}  Link: ${dev.pullrequesturl}`,
    });
  }
  //action => opened, closed
  getActionDetails(action: string, day: number) {
    this.gitService.ready().then(result => {
      this.gitService.getDeveloperDetail(this.gitService.currentOrg, day, 'null', action, 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
          v.body = v.body.replace(/\+/g, ' ');
          v.title = v.title.replace(/\+/g, ' ');
        });
      });
    });
  }

  ngOnInit() {
    this.initializeData();
  }
}
