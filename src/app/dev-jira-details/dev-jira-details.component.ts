import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of, Subject} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';
import {UsageService} from '@labshare/ngx-core-services';
import {getLocaleDateTimeFormat} from '@angular/common';

@Component({
  selector: 'app-dev-jira-details',
  templateUrl: './dev-jira-details.component.html',
  styleUrls: ['./dev-jira-details.component.less'],
})
export class DevJiraDetailsComponent implements OnInit {
  devDetails: any[];
  developer: string;
  navigationSubscription: any;
  bHideDetails: boolean = true;
  bShowError = false;
  developerName: string;

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

  closePane() {
    this.gitService.broadcastComponentMessage('CLOSE_JIRA_DETAILS');
    this.bHideDetails = true;
  }

  initializeData() {
    let x = Date.now.toString();
    //  this.usageService.send ({event: 'Dev Details', info: 'Gator - Dev-pull-request-details',  LogTime: x});

    this.devDetails = [];
    this.developer = '';

    this.gitService.ready().then(result => {
      this.gitService.onJiraEvent.subscribe((val: string) => {
        this.getDeveloperDetails(val);
      });
    });
  }

  getDeveloperDetails(developer: string) {
    this.developerName = developer;
    this.bShowError = false;
    const accountId = this.gitService.getAccountId4UserName(developer);

    if (accountId === undefined && this.gitService.jiraOrgList.length > 0) {
      this.bShowError = true;
      return;
    }
    if (accountId === '401') {
      this.router.navigate(['/jira-login']);
      return;
    }

    this.gitService.ready().then(result => {
      this.gitService.GetJiraIssues(this.gitService.jiraCurrentOrg, accountId, 50).subscribe(val => {
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
        this.devDetails = JSON.parse(val).issues;
        this.devDetails.map(v => {
          v.Repo = v.id;
          v.pullrequesturl = v.self;
          v.body = v.key;
          v.title = v.fields.summary;
          v.created_at = v.fields.created;
          v.body = v.fields.status.description;
          v.login = v.fields.assignee.displayName;
          v.State = v.fields.status.name;
        });
      });
    });
  }

  ngOnInit() {
    this.initializeData();
  }
}
