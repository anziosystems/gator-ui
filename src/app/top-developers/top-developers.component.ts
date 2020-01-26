import {Component, OnInit, EventEmitter, Inject, Output, Injectable, ViewChild} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, DevDetails} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import * as _ from 'lodash';
import {animate, state, style, transition, trigger, stagger, query, keyframes} from '@angular/animations';
import {ContextMenuComponent} from 'ngx-contextmenu';

@Component({
  selector: 'app-top-developers',
  templateUrl: './top-developers.component.html',
  styleUrls: ['./top-developers.component.less'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({opacity: 0}), {optional: true}),
        query(
          ':enter',
          stagger('300ms', [
            animate(
              '1s easae-in',
              keyframes([
                style({opacity: 0, transform: 'translateY(-75px)', offset: 0}),
                style({opacity: 0.5, transform: 'translateY(35px)', offset: 0.3}),
                style({opacity: 1, transform: 'translateY(0)', offset: 1}),
              ]),
            ),
          ]),
          {optional: true},
        ),
      ]),
    ]),
  ],
})
export class TopDevelopersComponent implements OnInit {
  developers: any[];
  devDetails: any[];
  navigationSubscription: any;
  filterQuery: string;
  OrgDevelopers: any[];
  items = [{label: 'Send Kudoes'}, {label: 'Monthly Status Reports'}, {label: 'Survery'}];

  @Output()
  messageEvent = new EventEmitter<string>(); //TODO: delete not used

  constructor(private gitService: GitService, @Inject(LOCAL_STORAGE) private storage: WebStorageService, private router: Router) {
    this.developers = [];

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  @ViewChild(ContextMenuComponent, {static: false}) public basicMenu: ContextMenuComponent;

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  GetData(dev: DevDetails) {
    if (this.gitService.currentContext === 'undefined') this.gitService.currentContext = 'GIT';

    if (this.gitService.currentContext === 'JIRA') {
      this.jiraData(dev);
    } else {
      this.gitData(dev);
    }
    
  }

  gitData(developer: DevDetails) {
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    this.gitService.currentDev = developer;
    this.gitService.trigger(developer.login);
    this.gitService.broadcastComponentMessage('SHOW_PULL_DETAILS');
    this.gitService.triggerCustomEvent ( {
      source: 'TOP-DEVELOPER',
      destination: 'STATUS-REPROT',
      message: developer.login 
    })
  }

  jiraData(developer: DevDetails) {
    this.gitService.currentDev = developer;
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //
    if (!this.storage.get('JiraToken')) {
      this.router.navigate(['/jira-login']);
      return;
    }
    // else {
    //   //Delete this else clause
    //   this.router.navigate(['/jiraStatus']);

    // }
    this.gitService.triggerJira(developer.name);
    this.gitService.broadcastComponentMessage('SHOW_JIRA_DETAILS');
  }

  filterDev(str: string) {
    if (str.length === 0) {
      this.developers = this.OrgDevelopers;
      return;
    }
    str = str.toLowerCase();
    this.developers = this.OrgDevelopers.filter(d => d.name.toLowerCase().substring(0, str.length) === str);
  }
  initializeData() {
    this.developers = [];

    this.gitService.ready().then(result => {
      this.gitService.getTopDevelopers(this.gitService.currentOrg, 15).subscribe(val => {
        const devs = val.map(item => item.Name + '--' + item.login + '--' + item.Avatar_Url).filter((value, index, self) => self.indexOf(value) === index);
        devs.map(item => {
          const arr = _.split(item, '--');
          let d = new DevDetails();
          d.image = arr[2];
          d.name = arr[0];
          d.login = arr[1];
          this.developers.push(d);
        });
        this.OrgDevelopers = this.developers;
        this.GetData(this.OrgDevelopers[0]);
      });
    });
  }

  rightClick(e: any, context: string, dev: DevDetails) {
    alert(dev.login + ' ' + context);
  }

  ngOnInit() {
    this.GetData(this.OrgDevelopers[0]);
  }
}
