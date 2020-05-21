import {Component, OnInit, Inject} from '@angular/core';
import {GitService, DevDetails} from '../git-service';
import {Router} from '@angular/router';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

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
  hookFail: boolean = true;
  ctr = 0;
  bGetFromGit: boolean = false;
  NO_OF_DAYS = 15;

  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {
    this.bGetFromGit = true;

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

    //Get the Tenant details - This will be logged in User
    this.gitService.getLoggedInUSerDetails(this.bGetFromGit).subscribe(async r2 => {
      this.hookFail = false;
      this.messages.push('Please wait, getting Org List ...');
      const org = await this.gitService.getCurrentOrg();
      //org going in here is Orgnization org, it is for OrgLink table
      this.gitService.getGitOrgList(org).subscribe(
        async _gitOrgs => {
          if (_gitOrgs.length > 0) {
            this.orgStatus = true;
            this.orgList = _gitOrgs;
            this.successMessages.push(`Yes! Found ${_gitOrgs.length} orgnization for this login`);
            //for every org check the hook
            await this.orgList.forEach(element => {
              // if (this.bGetFromGit) {
              //   this.messages.push('Checking Git Gator hook in ' + element.Org);
              // }
              // this.gitService.getHookStatus(element.Org).subscribe(r3 => {
              //   let hookStatus = r3.val;
              //   if (!hookStatus) {
              //     this.errMessages.push("For GitGator to work properly, you must install the web hook manually for org: " + element.Org);

              //     //lets install the hook
              //     // if (this.bGetFromGit) {
              //     //   this.messages.push('Installing web hook in ' + element.Org);
              //     // }
              //     // this.gitService.setupWebHook(element.Org).subscribe(r4 => {
              //     //   let hookReturn = r4.val;
              //     //   if (hookReturn === 201) {
              //     //     if (this.bGetFromGit) {
              //     //       this.successMessages.push('Git Gator hook is installed for org ' + element.Org);
              //     //     }
              //     //   } else {
              //     //     if (hookReturn === 422) {
              //     //       if (this.bGetFromGit) {
              //     //         this.messages.push('Git Gator hook is already installed for org ' + element.Org);
              //     //       }
              //     //     } else {
              //     //       if (hookReturn === 404) {
              //     //         if (this.bGetFromGit) {
              //     //           this.errMessages.push("Couldn't install Git Gator hook. Please install manually for org: " + element.Org);
              //     //           this.hookFail = true;
              //     //         }
              //     //       }
              //     //     }
              //     //   }
              //     // });
              //   } else {
              //     if (this.bGetFromGit) {
              //       this.messages.push('Git Gator hook is already installed in ' + element.Org);
              //     }
              //   }
              // });
              //Get Repos
              let gitOrg = element.url.substr('https://github.com/'.length);
              this.messages.push('Please Wait! Getting Repositories for ' + element.name);
              this.gitService.getRepoList(gitOrg, true, true).subscribe(
                async repos => {
                  //TODO: Turn the result into true and false
                  if (repos.length > 0) {
                    this.repoStatus = true;
                    this.repoCount = repos.length;
                    this.successMessages.push('Found ' + repos.length + ' Repositories for ' + element.name);
                   
                      this.gitService.getPullRequest(gitOrg, true, false).subscribe(pr => {
                        this.successMessages.push(`Pulling last 25 PR for all repos in ${gitOrg}`);
                      });
                
                  } else {
                    this.warningMessages.push('No Repositories found for organization: ' + element.name);
                  }
                },
                error => {
                  this.errMessages.push('Sorry, seems like something is wrong getting repository list. Please refresh the page. ');
                  this.errMessages.push(error.statusText);
                  clearTimeout(t);
                },
              );
              // this.successMessages.push(`Done!`);
              // this.buttonDisabled = false;
              // let elem = document.getElementById('myBar');
              // elem.style.width = '100%';
              // clearTimeout(t);
              //Just firing an extra call to prepare the cache in BE
            }); //org list loop
          } else {
            this.warningMessages.push('Did not get any orgnazation for this login. Please check in Git and make sure you belong to an organization.');
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
    });
  }

  ngOnInit() {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      window.location.reload();
    });
  }
}
