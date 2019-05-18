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

  constructor(private gitService: GitService, private router: Router) {
    //Get Org Details
    this.messages = [];
    this.errMessages = [];
    this.messages.push('Getting Org List');
    this.gitService.GetOrgList().subscribe(result => {
      if (result.length > 0) {
        this.orgStatus = true;
        this.orgList = result;
        this.gitService.currentOrg = this.orgList[0].Org;

        this.orgList.forEach(element => {
          this.messages.push('Checking Gator hook in ' + element.Org);
          this.gitService.GetHookStatus(element.Org).subscribe(result => {
            this.hookStatus = result.val;
            if (!this.hookStatus) {
              //lets install the hook
              this.messages.push('Installing web hook ...');
              this.gitService.SetupWebHook(element.Org).subscribe(result => {
                this.hookStatus = result.val;
                if (this.hookStatus) {
                  this.messages.push('Gator hook is installed!');
                } else {
                  this.errMessages.push("Couldn't install Gator hook. Please install manually");
                }
              });
            } else {
              this.messages.push('Gator hook is already installed in ' + element.Org);
            }
          });
          //Get Repos
          this.gitService.GetRepoList(element.Org).subscribe(result => {
            //TODO: Turn the result into true and false
            if (result.length > 0) {
              this.repoStatus = true;
              this.repoCount = result.length;
              this.messages.push('Found Repositories: ' + result.length + ' for ' + element.Org);
            }
          });

          this.messages.push('Getting last 10 pull request from all repositories for ' + element.Org + ' Please wait ..');

          //Get Pull Request
          this.gitService.GetPullRequest(element.Org).subscribe(result => {
            //TODO: Turn the result into true and false
            this.messages.push('Done! Getting pull request for ' + element.Org + ' from ' + result + ' repositories');
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
