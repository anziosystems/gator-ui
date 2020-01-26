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
  selector: 'app-dev-jira-details',
  templateUrl: './dev-jira-details.component.html',
  styleUrls: ['./dev-jira-details.component.less'],
})
export class DevJiraDetailsComponent implements OnInit {
  devDetails: any;
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

  constructor(private gitService: GitService, private router: Router, 
    // private usageService: UsageService
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
    this.gitService.broadcastComponentMessage('CLOSE_JIRA_DETAILS');
    this.bHideDetails = true;
  }

  initializeData() {
    let x = Date.now.toString();
    //  this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});

    this.devDetails = new Map();
    this.devDetails2 = [];
    this.developer = '';

    this.gitService.ready().then(result => {
      this.gitService.onJiraEvent.subscribe((val: string) => {
        this.getDeveloperDetails(val);
      });
    });
  }

  //addJiraDetails
  addJiraDetails(dev: any) {
    this.gitService.triggerCustomEvent({
      source: 'JIRA',
      destination: 'STATUS-REPORT',
      message: `${dev.title}  Created at: ${dev.created_at}  Link: ${dev.pullrequesturl}`,
    });
  }

  async getDeveloperDetails(developer: string) {
    this.devDetails = new Map();
    this.devDetails2 = [];
    this.developerName = developer;
    this.bShowError = false;

    this.gitService.getJiraAccountId4UserName(developer).then(
      accountId => {
        if (accountId === undefined && this.gitService.jiraOrgList.length > 0) {
          this.bShowError = true;
          return;
        }

        this.gitService.jiraOrgList.forEach(
          org => {
            this.gitService.ready().then(result => {
              this.gitService.GetJiraIssues(org.id, accountId, 50, false).subscribe(val => {
                /*
          JSON.parse (val)
          {expand: "schema,names", startAt: 0, maxResults: 50, total: 2, issues: Array(2)}


          JSON.parse (val).issues[0]
          {expand: "operations,versionedRepresentations,editmeta,changelog,renderedFields", id: "36738", self: "https://api.atlassian.com/ex/jira/0e493c98-6102-463a-bc17-4980be22651b/rest/api/3/issue/36738", key: "LSAUTH-191", fields: {…}}
          expand: "operations,versionedRepresentations,editmeta,changelog,renderedFields"
          fields: {summary: "Add ability to delete client login page configuration", assignee: {…}, updated: "2019-12-04T14:26:29.745-0500", created: "2019-10-03T12:07:17.880-0400", status: {…}}
          id: "36738"
          key: "LSAUTH-191"
          self: "https://api.atlassian.com/ex/jira/0e493c98-6102-463a-bc17-4980be22651b/rest/api/3/issue/36738"


          JSON.parse (val).issues[0].fields.summary
          JSON.parse (val).issues[0].self  //url
        */
                if (val) {
                  if (val.length === 0) return;
                  try {
                    if (Array.isArray(val)) {
                      this.devDetails2 = val; //cache is sending array
                    } else {
                      this.devDetails2 = JSON.parse(val).issues; //first call is sending json
                    }
                  } catch (ex) {
                    console.log(ex.message);
                  }

                  this.devDetails2.map(v => {
                    //https://labshare.atlassian.net/jira/people/5ca21c371b65666cbad27eb0
                    this.userLink = `https://${org.name}.atlassian.net/jira/people/${accountId}`;
                    v.Repo = v.id;
                    v.pullrequesturl = `https://${org.name}.atlassian.net/browse/${v.key}`;
                    v.key = v.key;
                    v.title = v.fields.summary;
                    v.created_at = v.fields.created;
                    v.updated = v.fields.updated;
                    v.body = v.fields.status.description;
                    v.login = v.fields.assignee.displayName;
                    this.userName = v.fields.assignee.displayName;
                    v.State = v.fields.status.name;
                    v.orgName = org.name;
                    if (!this.devDetails.has(v.id)) this.devDetails.set(v.id, v);
                  });
                }
              });
            });
          },
          failVal => {
            if (failVal === '401') {
              this.router.navigate(['/jira-login']);
              return;
            }
          },
        );
      },
      failVal => {
        if (failVal === '401') {
          this.router.navigate(['/jira-login']);
          return;
        }
      },
    );
  }

  ngOnInit() {
    this.initializeData();
  }
}
