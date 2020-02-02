import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-jira-status',
  templateUrl: './jira-status.component.html',
  styleUrls: ['./jira-status.component.less'],
})
export class JiraStatusComponent implements OnInit {
  hookStatus: boolean = false;
  orgStatus: boolean = false;
  repoStatus: boolean = false;
  prStatus: boolean = false;
  repoCount: number = 0;
  orgList: any;
  messages: string[];
  successMessages: string[];
  errMessages: string[];
  warningMessages: string[];
  progress: string[];
  buttonDisabled: boolean = true;
  hookFail: boolean = true;
  ctr = 0;

  constructor(private gitService: GitService, private router: Router) {
    this.loginAndSetup();
  }

  wait(ms) {
    let start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }

  loginAndSetup() {
    //Get Org Details

    this.messages = [];
    this.errMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.progress = [];

    let statusbarWidth = 1;
    let t = setInterval(() => {
      let elem = document.getElementById('myBar');
      statusbarWidth = statusbarWidth + 1;
      if (statusbarWidth < 100) {
        elem.style.width = statusbarWidth + '%';
      } else {
        clearTimeout(t);
      }
    }, 200); //every 200 ms

    this.gitService.getJiraOrgs(true).subscribe(
      //superflaus call, just waking up the sleeping API
      res => {
        this.hookFail = false;
        this.buttonDisabled = true;
        this.messages.push('Please wait, getting Org List ...');
        this.gitService.JiraUsersList = [];
        this.gitService.getJiraOrgs(true).subscribe(
          result => {
            if (result.code === 401) {
              clearTimeout(t);
              this.errMessages.push('Unauthorized. Token Expired');
              this.sleep(5000).then(() => {
                this.router.navigate(['/jira-login']);
                return;
              });
            }
            if (result.length > 0) {
              this.orgStatus = true;
              this.orgList = result;
              this.gitService.jiraOrgList = result;
              if (this.gitService.getJiraCurrentOrg == undefined) {
                this.gitService.setJiraCurrentOrg(this.orgList[0].id);
              }
              this.successMessages.push(`Yes! Found ${result.length} orgnization for this login`);
              //for every org check the hook
              this.orgList.forEach(element => {
                this.messages.push(`Get Dev list for :${element.name}`);
                this.gitService.getJiraUsers(element.id, true).subscribe(result => {
                  if (result.code === 401) {
                    clearTimeout(t);
                    this.errMessages.push('Unauthorized. Token Expired');
                    this.sleep(50).then(() => {
                      this.router.navigate(['/jira-login']);
                      return;
                    });
                  }

                  result.forEach(e2 => {
                    this.gitService.JiraUsersMap.set(e2.DisplayName.trim(), e2.AccountId.trim());
                  });

                  // this.gitService.JiraUsersList.push(result);
                  /*
                   Array(29) [Object, Object, Object, Object, Object, Object, Object, Object, …]
                   JSON.parse(result)[0]
                   Object {self: "https://api.atlassian.com/ex/jira/786d2410-0054-41…", accountId: "5d53f3cbc6b9320d9ea5bdc2", accountType: "app", avatarUrls: Object, displayName: "Jira Outlook", …}
   
                  */
                  this.successMessages.push(`Yes! Found ${result.length} users for org: ${element.name}`);
                  this.buttonDisabled = false;
                  this.router.navigate(['/dashboard']);
                });
              }); //org list loop
            } else {
              this.warningMessages.push('Did not get any orgnazation for this login. Please login in Jira and make sure you belong to an organization.');
              this.warningMessages.push('Exiting!!!');
              let elem = document.getElementById('myBar');
              elem.style.width = '100%';
              clearTimeout(t);
              this.sleep(500).then(() => {
                this.router.navigate(['/jira-login']);
              });
            }
          },
          error => {
            this.errMessages.push('Sorry, seems like something is wrong. Please refresh the page. Please feel free to send us message at support@anziosystems.com ');
            this.errMessages.push(error.message);
            clearTimeout(t);
            this.sleep(800).then(() => {
              this.router.navigate(['/jira-login']);
            });
          },
        );
      },
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit() {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      //window.location.reload();
    });
  }
}
