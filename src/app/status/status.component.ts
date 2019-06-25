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
  successMessages: string[];
  errMessages: string[];
  warningMessages: string[];
  progress: string[];
  buttonDisabled: boolean = true;

  constructor(private gitService: GitService, private router: Router) {
    //Get Org Details
    this.messages = [];
    this.errMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.progress = [];

    
    let statusbarWidth = 1;
    let t = setInterval(() => {
      let elem = document.getElementById("myBar");
      statusbarWidth = statusbarWidth + 1;
      if (statusbarWidth < 100) {
        elem.style.width = statusbarWidth + '%'; 
      }
      else {
           clearTimeout (t);
      }
    }, 200); //every 200 ms

    this.messages.push('Please wait, getting Org List ...');
    this.gitService.getOrgList(true, true).subscribe(result => {
      if (result.length > 0) {
        this.orgStatus = true;
        this.orgList = result;
        if (this.gitService.currentOrg == undefined) {
          this.gitService.currentOrg = this.orgList[0].Org;
        }
        this.successMessages.push(`Yes! Found ${result.length} orgnization for this login`);
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
                  this.successMessages.push('Gator hook is installed!');
                } else {
                  this.errMessages.push("Couldn't install Gator hook. Please install manually.");
                }
              });
            } else {
              this.messages.push('Gator hook is already installed in ' + element.Org);
            }
          });
          //Get Repos
          this.messages.push('Please Wait! Getting Repositories for ' + element.Org);
          this.gitService.getRepoList(element.Org, true, true).subscribe(result => {
            //TODO: Turn the result into true and false
            if (result.length > 0) {
              this.repoStatus = true;
              this.repoCount = result.length;
              this.successMessages.push('Found Repositories: ' + result.length + ' for ' + element.Org);
            } else {
              this.warningMessages.push('No Repositories found for organization: ' + element.Org);
            }
          }, error => {
            this.errMessages.push('Sorry, seems like something is wrong getting repository list. Please refresh the page. ');
            this.errMessages.push(error.statusText);
            clearTimeout (t);
          });

          this.messages.push('Getting last 10 pull request from all repositories for ' + element.Org + ' Please wait ..');

          //Get Pull Request
          this.gitService.getPullRequest(element.Org, true, true).subscribe(result => {
            //TODO: Turn the result into true and false
            this.successMessages.push('Done! Getting pull request for ' + element.Org + ' from ' + result + ' repositories');
            this.buttonDisabled = false;
            let elem = document.getElementById("myBar");
            elem.style.width = '100%'; 
            clearTimeout (t);
          }, error => {
            this.errMessages.push('Sorry, seems like something is wrong getting PR. Please refresh the page. ');
            this.errMessages.push(error.statusText);
            clearTimeout (t);
          });
        }); //org list loop
      } else {
        this.warningMessages.push('Did not get any orgnazation for this login. Please check in git hub and make sure you belong to an organization.');
        this.warningMessages.push('Exiting!!!');
        let elem = document.getElementById("myBar");
        elem.style.width = '100%'; 
        clearTimeout (t);
      }
    }, error => {
      this.errMessages.push('Sorry, seems like something is wrong. Please refresh the page. Please feel free to send us message at support@anziosystems.com ');
      this.errMessages.push(error.message);
      clearTimeout (t);
    });

    

  }

  ngOnInit() {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
  }
}
