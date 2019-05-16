import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';

@Component({
  selector: 'app-top-developers',
  templateUrl: './top-developers.component.html',
  styleUrls: ['./top-developers.component.less'],
})
export class TopDevelopersComponent implements OnInit {
  developers: any[];
  avatar: any[];
  devDetails: any[];
  navigationSubscription: any;

  @Output()
  messageEvent = new EventEmitter<string>();

  constructor(private gitService: GitService, private router: Router) {
    this.developers = [];
    this.avatar = [];

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

  data(developer: string) {
    this.gitService.trigger(developer);
  }

  initializeData() {
    this.developers = [];
    this.avatar = [];
    this.gitService.Ready().then(result => {
      this.gitService.GetTopDevelopers(this.gitService.currentOrg, 7).subscribe(val => {
        const devs = val.map(item => item.login + '--' + item.Avatar_Url).filter((value, index, self) => self.indexOf(value) === index);
        devs.map(item => {
          const arr = _.split(item, '--');
          this.avatar.push(arr[1]);
          console.log(this.avatar);
          this.developers.push(arr[0]);
        });
      });
    });
  }

  ngOnInit() {}
}
