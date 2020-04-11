import {Component, OnInit, EventEmitter, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, CustomEvent} from '../git-service';
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
      this.gitService.onJiraEvent.subscribe(async (val: string) => {
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
    this.gitService.triggerCustomEvent({
      source: 'JIRA',
      destination: 'STATUS-REPORT',
      message: `${dev.title}  Created at: ${dev.created_at}  Link: ${dev.pullrequesturl}`,
    });
  }

  async getDeveloperDetails(developer: string) {
    this.userName = developer;
    this.devDetails = new Map();
    this.devDetails3 = new Map();
    this.devDetails2 = [];
    this.developerName = developer;
    this.bShowError = false;
    this.Error401 = false;
    let p: Promise<any>[] = [];
    console.log(`Getting Jira details for ${developer}`);
    return this.gitService.getJiraAccountId4UserName(developer).then(
      async accountId => {
        if (accountId === undefined) {
          console.log(`Could not get ${developer} from JiraUsersMap`);
          this.bShowError = true;
          return;
        }
        //For Jira, I get issues for all the org's he belong to, we dont filter on the org, where as in Git we do.
        //Reasoning is user total load we would like to see, hence all the org tickets
        //org name is written in details of the Jira ticket
        await this.gitService.jiraOrgList.forEach(
          async org => {
            await this.gitService.ready().then(async result => {
              console.log(`Getting Jira Issue for ${developer} ${org.name} accountId: ${accountId} `);
              p.push(
                this.gitService
                  .GetJiraIssues(org.id, accountId, 50, false)
                  .toPromise()
                  .then((val: any) => {
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
                    //sometime server send 403 - which we are ignoring here because we get for the no of user which is different from 401
                    //we need to capture only 401 for user to take them back to login
                    if (val.code === 401 || val.code === 403) {
                      if (val.code === 401) {
                        this.Error401 = true;
                        //But check if it got data for other org
                        console.log(`got 401 for dev: ${developer} org: ${org.name} and AccountId: ${accountId}`);
                      } else console.log(`got 403 for dev: ${developer} org: ${org.name} and AccountId: ${accountId}`);
                    } else {
                      if (val.code === 200) this.Error401 = false; //it means we are not 401 for all the org, when the token expires all org will give 401
                      if (val) {
                        if (val.length === 0) {
                          console.log(`No data by GetJiraIssues. for dev: ${developer} org: ${org.name} and AccountId: ${accountId}`);
                          return;
                        }

                        try {
                          if (Array.isArray(val)) {
                            this.devDetails2 = val; //cache is sending array
                            console.log(`Found ${this.devDetails2.length} by GetJiraIssues. for dev: ${developer} org: ${org.name} and AccountId: ${accountId}`);
                          } else {
                            //"{"startAt":0,"maxResults":50,"total":0,"issues":[]}"
                            this.devDetails2 = JSON.parse(val).issues; //When there are 0 issues, message get format as follows
                            console.log(`Found ${this.devDetails2.length} by GetJiraIssues. for dev: ${developer} org: ${org.name} and AccountId: ${accountId}`);
                          }
                        } catch (ex) {
                          console.log('GetJiraIssues: ' + ex.message);
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
                          if (!this.devDetails3.has(v.id)) {
                            this.devDetails3.set(v.id, v);
                          } else {
                            console.log(`id clash`);
                          }
                        });
                      } else {
                        //if val is null it may have a 401 - token may be expired
                      }
                    }
                  }),
              );
              Promise.all(p).then(() => {
                //I want this thing should be called when i collect all the issues for all the orgs
                //it is not happening 
                this.devDetails = this.devDetails3;
                if (this.devDetails.size === 0 && this.Error401) {
                  console.log('***** Done *******');
                  this.router.navigate(['/jira-login']);
                }
              });
              // .finally (() => { console.log ("finally called!")});
            });
          },
          failVal => {
            if (failVal === '401') {
              this.router.navigate(['/jira-login']);
              return;
            } else {
              console.log('Error in getDeveloperDetails - GetJiraIssues in Jira ' + failVal);
            }
          },
        );
      },
      failVal => {
        if (failVal === '401') {
          this.router.navigate(['/jira-login']);
          return;
        } else {
          console.log('Error in getDeveloperDetails -  in Jira ' + failVal);
        }
      },
    );
  }

  ngOnInit() {
    this.initializeData();
  }
}
