import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-dev-pull-details',
  templateUrl: './dev-pull-details.component.html',
  styleUrls: ['./dev-pull-details.component.less'],
})
export class DevPullDetailsComponent implements OnInit {
  devDetails: any[];
  developer: string;
  navigationSubscription: any;

  constructor(private gitService: GitService, private router: Router) {
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
    this.devDetails = [];
    this.developer = '';
    this.gitService.Ready().then(result => {
      this.gitService.onMyEvent.subscribe((val: string) => {
        if (val.lastIndexOf('+') > 0) {
          const arr = _.split(val, '+');
          this.getActionDetails(arr[0], Number(arr[1]));
        } else {
          if (val.startsWith('repo-')) {
            const arr = _.split(val, 'repo-');
            this.gitService.GetRepositoryPR(this.gitService.currentOrg, 15, arr[1], 50).subscribe(val => {
              this.devDetails = val;
              this.devDetails.map(v => {
                let s = v.pullrequesturl;
                s = s.replace('https://api.github.com/repos', 'https://github.com');
                s = s.replace('pulls', 'pull');
                s = s.replace('comments', ' ');
                v.pullrequesturl = s;
              });
            });
          } else this.getDeveloperDetails(val);
        }
      });
    });
  }

  getDeveloperDetails(developer: string) {
    this.gitService.Ready().then(result => {
      this.gitService.GetDeveloperDetail(this.gitService.currentOrg, 15, developer, 'null', 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
        });
      });
    });
  }

  //action => opened, closed
  getActionDetails(action: string, day: number) {
    this.gitService.Ready().then(result => {
      this.gitService.GetDeveloperDetail(this.gitService.currentOrg, day, 'null', action, 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
        });
      });
    });
  }
  ngOnInit() {
    this.initializeData();
  }
}
