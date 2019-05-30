import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Router} from '@angular/router';
@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.less'],
})
export class StatusComponent implements OnInit {
  hookStatus: boolean = false;
  orgStatus: boolean = false;
  repoStatus: boolean = false;
  prStatus: boolean = false;
  repoCount: number = 0;
  orgList: any;
  messages: string[];
  errMessages: string[];
  buttonDisabled: boolean = true;

  constructor(private gitService: GitService, private router: Router) {
    //Get Org Details
    this.messages = [];
    this.errMessages = [];

    this.messages.push('Please wait, getting Org List');
    this.gitService.getOrgList(true, true).subscribe(result => {
      if (result.length > 0) {
        this.orgStatus = true;
        this.orgList = result;
        if (this.gitService.currentOrg == undefined) {
          this.gitService.currentOrg = this.orgList[0].Org;
        }
        //for every org check the hook
        this.orgList.forEach(element => {
          this.messages.push('Checking Gator hook in ' + element.Org);
          this.gitService.getHookStatus(element.Org).subscribe(result => {
            this.hookStatus = result.val;
            if (!this.hookStatus) {
              //lets install the hook
              this.messages.push('Installing web hook ...');
              this.gitService.setupWebHook(element.Org).subscribe(result => {
                this.hookStatus = result.val;
                if (this.hookStatus) {
                  this.messages.push('Gator hook is installed!');
                } else {
                  this.errMessages.push("Couldn't install Gator hook. Please install manually.");
                }
              });
            } else {
              this.messages.push('Gator hook is already installed in ' + element.Org);
            }
          });
          //Get Repos
          this.gitService.getRepoList(element.Org, true, true).subscribe(result => {
            //TODO: Turn the result into true and false
            if (result.length > 0) {
              this.repoStatus = true;
              this.repoCount = result.length;
              this.messages.push('Found Repositories: ' + result.length + ' for ' + element.Org);
            }
          });

          this.messages.push('Getting last 10 pull request from all repositories for ' + element.Org + ' Please wait ..');

          //Get Pull Request
          this.gitService.getPullRequest(element.Org, true, true).subscribe(result => {
            //TODO: Turn the result into true and false
            this.messages.push('Done! Getting pull request for ' + element.Org + ' from ' + result + ' repositories');
            this.buttonDisabled = false;
          });
        });
      }
    });
  }

  ngOnInit() {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
  }
}
