import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';
import { UsageService } from '@labshare/ngx-core-services';
import { getLocaleDateTimeFormat } from '@angular/common';

@Component({
  selector: 'app-dev-pull-details',
  templateUrl: './dev-pull-details.component.html',
  styleUrls: ['./dev-pull-details.component.less'],
})
export class DevPullDetailsComponent implements OnInit {
  devDetails: any[];
  developer: string;
  navigationSubscription: any;

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

  initializeData() {
    let x = Date.now.toString();
    this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});
 
    this.devDetails = [];
    this.developer = '';
    this.gitService.ready().then(result => {
      this.gitService.onMyEvent.subscribe((val: string) => {
        if (val.lastIndexOf('+') > 0) {
          const arr = _.split(val, '+');
          this.getActionDetails(arr[0], Number(arr[1]));
        } else {
          if (val.startsWith('repo-')) {
            const arr = _.split(val, 'repo-');
            this.gitService.getRepositoryPR(this.gitService.currentOrg, 15, arr[1], 50).subscribe(val => {
              this.devDetails = val;
              this.devDetails.map(v => {
                let s = v.pullrequesturl;
                s = s.replace('https://api.github.com/repos', 'https://github.com');
                s = s.replace('pulls', 'pull');
                s = s.replace('comments', ' ');
                v.pullrequesturl = s;
                v.body = v.body.replace(/\+/g,' ');
                v.title = v.title.replace(/\+/g,' ');
              });
            });
          } else this.getDeveloperDetails(val);
        }
      });
    });
  }

  getDeveloperDetails(developer: string) {
    this.gitService.ready().then(result => {
      this.gitService.getDeveloperDetail(this.gitService.currentOrg, 15, developer, 'null', 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
          v.body = v.body.replace(/\+/g,' ');
          v.title = v.title.replace(/\+/g,' ');
        });
      });
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
          v.body = v.body.replace(/\+/g,' ');
          v.title = v.title.replace(/\+/g,' ');
        });
      });
    });
  }

  ngOnInit() {
    this.initializeData();
   }
}
