import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import {Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-top-repository',
  templateUrl: './top-repository.component.html',
  styleUrls: ['./top-repository.component.less'],
})
export class TopRepositoryComponent implements OnInit {
  repositories: any[];

  navigationSubscription: any;

  constructor(private gitService: GitService, private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  data(repo: string) {
    this.gitService.trigger('repo-' + repo);
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
    this.gitService.Ready().then(result => {
      this.gitService.GetTopRepositories(this.gitService.currentOrg, 15).subscribe(val => {
        // Filter out the duplicates
        this.repositories = val.map(item => item.Repo).filter((value, index, self) => self.indexOf(value) === index);
      });
    });
  }

  ngOnInit() {}
}
