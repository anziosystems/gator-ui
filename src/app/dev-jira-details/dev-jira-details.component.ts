import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import * as _ from 'lodash';
// import {UsageService} from '@labshare/ngx-core-services';
import {getLocaleDateTimeFormat} from '@angular/common';

@Component({
  selector: 'app-dev-jira-details',
  templateUrl: './dev-jira-details.component.html',
  styleUrls: ['./dev-jira-details.component.less'],
})
export class DevJiraDetailsComponent implements OnInit {
  devDetails: any;
  devDetails3: any;
  devDetails2: any[];
  developer: string;
  navigationSubscription: any;
  bHideDetails: boolean = true;
  bShowError = false;
  developerName: string;
  orgName: string;
  userName: string;
  userLink: string;
  bShowAddButton: boolean = false;
  Error401 = false;
  constructor(
    private gitService: GitService,
    private router: Router, // private usageService: UsageService
  ) {
    let x = Date.now.toString();
    //  this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});
    this.devDetails = new Map();
    this.devDetails3 = new Map();
    this.devDetails2 = [];
    this.developer = '';
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });

    this.gitService.ready().then(result => {
      this.gitService.fillJiraUserMap();
      this.gitService.onJiraEvent.subscribe(async (val: DevDetails) => {
        this.getDeveloperDetails(val)
          .then(() => {
            // if (this.devDetails.size === 0 && this.Error401) {
            //   this.router.navigate(['/jira-login']);
            // }
          })
          .finally(() => {
            console.log('done');
          });
      });
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
    this.gitService.broadcastGlobalComponentMessage('CLOSE_JIRA_DETAILS');
    this.bHideDetails = true;
  }

  initializeData() {}

  //addJiraDetails
  addJiraDetails(dev: any) {
    this.gitService.broadcastCustomEvent({
      source: 'JIRA',
      destination: 'STATUS-REPORT',
      message: `${dev.title}  Created at: ${dev.created_at}  Link: ${dev.pullrequesturl}`,
    });
  }

  async getDeveloperDetails(developer: DevDetails) {
    this.userName = developer.JiraUserName;
    this.devDetails = new Map();
    this.devDetails3 = new Map();
    this.devDetails2 = [];
    this.developerName = developer.DisplayName;
    this.bShowError = false;
    this.Error401 = false;
    let p: Promise<any>[] = [];
    console.log(`Getting Jira details for ${developer.JiraUserName}`);
    let org = await this.gitService.getCurrentOrg();
    this.gitService
      .GetJiraData(org, developer.JiraUserName, 50, false)
      .toPromise()
      .then((val: any) => {
        this.devDetails = val; //cache is sending array
      });
  }

  ngOnInit() {
    this.initializeData();
  }
}
