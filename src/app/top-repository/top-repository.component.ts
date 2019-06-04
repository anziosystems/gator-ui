import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import {Router, NavigationEnd} from '@angular/router';
import { UsageService } from '@labshare/ngx-core-services';

@Component({
  selector: 'app-top-repository',
  templateUrl: './top-repository.component.html',
  styleUrls: ['./top-repository.component.less'],
})
export class TopRepositoryComponent implements OnInit {
  repositories: any[];

  navigationSubscription: any;

  constructor(private gitService: GitService, private router: Router, private usageService: UsageService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  data(repo: string) {
    this.gitService.trigger('repo-' + repo);
    const date = new Date();

    this.usageService.send ({event: 'Repo Details', info: 'Repo: ' + repo,  LogTime: date.toUTCString()});
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
    this.repositories = [];
    this.gitService.ready().then(result => {
      this.gitService.getTopRepositories(this.gitService.currentOrg, 15).subscribe(val => {
        // Filter out the duplicates
        this.repositories = val.map(item => item.Repo).filter((value, index, self) => self.indexOf(value) === index);
      });
    });
  }

  ngOnInit() {}
}
