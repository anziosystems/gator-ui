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
        this.messages.push('Please wait, getting Org List ...');
        this.gitService.getJiraOrgs(true).subscribe(
          result => {
            if (result.length > 0) {
              this.orgStatus = true;
              this.orgList = result;
              if (this.gitService.currentOrg == undefined) {
                this.gitService.currentOrg = this.orgList[0].Org;
              }
              this.successMessages.push(`Yes! Found ${result.length} orgnization for this login`);
              //for every org check the hook
              this.orgList.forEach(element => {
                this.messages.push(`Get Dev list for :${element.name}`);
                //  this.gitService.getJiraOrgs(true).subscribe(result => {

                //  });
              }); //org list loop
            } else {
              this.warningMessages.push('Did not get any orgnazation for this login. Please login in Jira and make sure you belong to an organization.');
              this.warningMessages.push('Exiting!!!');
              let elem = document.getElementById('myBar');
              elem.style.width = '100%';
              clearTimeout(t);
            }
          },
          error => {
            this.errMessages.push('Sorry, seems like something is wrong. Please refresh the page. Please feel free to send us message at support@anziosystems.com ');
            this.errMessages.push(error.message);
            clearTimeout(t);
          },
        );
      },
    );
  }
  ngOnInit() {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
  }
}
