import {Component, OnInit, EventEmitter, Inject, Output, Injectable, ViewChild} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, DevDetails} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {DialogModule} from 'primeng/dialog';
import {InputTextareaModule} from 'primeng/inputtextarea';

import * as _ from 'lodash';
import {animate, state, style, transition, trigger, stagger, query, keyframes} from '@angular/animations';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {SortIcon} from 'primeng';

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
  backgroundColor: string = '#26262fcc';
  filterQuery: string;
  OrgDevelopers: any[];
  bCallingFromInit: boolean = false;
  selectedDev: string;
  //items = [{label: 'Send Kudos'}, {label: 'Start a Watch'}];
  items = [
    {name: 'John', otherProperty: 'Foo'},
    {name: 'Joe', otherProperty: 'Bar'},
  ];
  display: boolean = false;
  kudoesText: string = 'Please type here your kudoes ...';

  constructor(private gitService: GitService, @Inject(LOCAL_STORAGE) private storage: WebStorageService, private router: Router) {
    this.developers = [];

    this.gitService.onGlobalComponentMessage.subscribe((val: string) => {
      if (val === 'REPO_CLICKED') {
        this.backgroundColor = '#26262fcc';
      }
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  showOD() {
    this.gitService.broadcastGlobalComponentMessage('SHOW_OD');
  }
  GetData(dev: DevDetails) {
    if (this.gitService.getCurrentContext() === 'undefined') this.gitService.setCurrentContext('GIT');
    this.selectedDev = dev.login;
    if (this.gitService.getCurrentContext() === 'JIRA') {
      this.jiraData(dev);
    } else {
      this.gitData(dev);
    }
  }

  getBGStyle(val: DevDetails) {
    let clr = 'white';
    if (this.selectedDev === val.login) {
      if (this.gitService.getCurrentContext() === 'JIRA') {
        clr = 'rgb(86, 125, 143)';
      } else {
        clr = 'rgb(170, 125, 105)';
      }
      return {
        background: clr,
        color: 'white',
      };
    } else {
      return {
        background: '#26262fcc',
        color: 'white',
      };
    }
  }

  getMyStyle(val: DevDetails) {
    let clr = 'white';
    if (this.gitService.getCurrentContext() === 'JIRA') {
      clr = 'rgb(86, 125, 143)';
    } else {
      clr = 'rgb(170, 125, 105)';
    }

    if (this.selectedDev === val.login) {
      return {
        color: clr,
      };
    } else {
      return {
        color: 'white',
      };
    }
  }

  gitData(developer: DevDetails) {
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    this.gitService.setCurrentDev(developer);
    //this.gitService.trigger(developer.login);
    this.gitService.broadcastDevLoginId(developer.login);
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
    //This to add developer in the status report component
    if (!this.bCallingFromInit) {
      this.gitService.triggerCustomEvent({
        source: 'TOP-DEVELOPER',
        destination: 'STATUS-REPORT',
        message: developer.login,
      });
    }
  }

  jiraData(developer: DevDetails) {
    this.gitService.setCurrentDev(developer);
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
    this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
  }

  filterDev(str: string) {
    if (str.length === 0) {
      this.developers = this.OrgDevelopers;
      return;
    }
    str = str.toLowerCase();
    this.developers = this.OrgDevelopers.filter(d => d.name.toLowerCase().substring(0, str.length) === str);
  }

  defaultBackground: string;
  defaultColor: string;

  initializeData() {
    this.developers = [];

    this.gitService.ready().then(result => {
      this.gitService.getGitTopDevelopers(this.gitService.getCurrentGitOrg(), 30).subscribe(val => {
        const devs = val.map(item => item.Name + '--' + item.login + '--' + item.Avatar_Url).filter((value, index, self) => self.indexOf(value) === index);
        devs.map(item => {
          const arr = _.split(item, '--');
          let d = new DevDetails();
          d.image = arr[2];
          d.name = arr[0];
          d.login = arr[1];
          if (d.login === 'TummuriLohitha' || d.login === 'dquispe') d.bWatch = true;
          if (d.login === 'caok2709' || d.login === 'AlexF4Dev') d.bKudos = true;
          this.developers.push(d);
        });
        this.OrgDevelopers = this.developers;
        //      this.GetData(this.OrgDevelopers[0]);
      });
    });
  }

  showWatch(dev: DevDetails) {
    alert(`Someone is watching your PR. Right click to subscribe to anyone's PR`);
  }

  showKudos(dev: DevDetails) {
    alert('Feature coming soon!');
  }

  rightClick(e: any, context: string, dev: DevDetails) {
    dev = e.item;
    if (context === 'Kudos') {
      this.kudoesText = `Please type here kudoes for ${dev.name}`;
      this.display = true;
    }
    if (context === 'Watch') {
      alert(`Coming Soon. - Watch ${dev.name} PR. You will get an alert`);
    }
  }

  kudoesYes() {
    this.display = true;
  }

  kudoesNo() {
    this.display = true;
  }

  ngOnInit() {
    let bCallingFromInit = true;
    // this.GetData(this.OrgDevelopers[0]);
  }
}
