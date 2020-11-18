import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';

import {Router, NavigationEnd} from '@angular/router';

import * as _ from 'lodash';
// import { UsageService } from '@labshare/ngx-core-services';

@Component({
  selector: 'app-top-repository',
  templateUrl: './top-repository.component.html',
  styleUrls: ['./top-repository.component.less'],
})
export class TopRepositoryComponent implements OnInit {
  repositories: any[];
  OrgRepositories: any[];
  navigationSubscription: any;
  selectedRepo: string;

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

  getMyStyle(val: string) {
    if (this.selectedRepo === val) {
      return {
        color: 'rgb(170, 125, 105)',
      };
    } else {
      return {
        color: 'white',
      };
    }
  }

  data(repo: string) {
    this.selectedRepo = repo;
    this.gitService.broadcastStringValue('repo-' + repo);
    const date = new Date();
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
    this.gitService.broadcastGlobalComponentMessage('REPO_CLICKED');

    // this.usageService.send ({event: 'Repo Details', info: 'Repo: ' + repo,  LogTime: date.toUTCString()});
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  filterRepo(str: string) {
    if (str.length === 0) {
      this.repositories = this.OrgRepositories;
      return;
    }
    str = str.toLowerCase();
    this.repositories = this.OrgRepositories.filter(d => d.toLowerCase().substring(0, str.length) === str);
  }
  initializeData() {
    this.repositories = [];
    this.gitService.ready().then(result => {
      this.gitService.getTopRepositories(this.gitService.getCurrentGitOrg(), 15).subscribe(val => {
        // Filter out the duplicates
        this.repositories = val.map(item => _.upperFirst(item.Repo)).filter((value, index, self) => self.indexOf(value) === index);
        this.OrgRepositories = this.repositories;
      });
    });
  }

  ngOnInit() {}
}
