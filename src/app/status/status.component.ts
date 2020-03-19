import {Component, OnInit, Inject} from '@angular/core';
import {GitService, DevDetails} from '../git-service';
import {Router} from '@angular/router';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';

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
    this.bGetFromGit = sessionStorage.get('LBC');

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
    this.gitService.getGitLoggedInUSerDetails(this.bGetFromGit).subscribe(r2 => {
      let dd = new DevDetails();
      console.log (`loginAndSetup=> ${r2.Id}`)
      dd.name = r2.DisplayName;
      dd.login = r2.UserName;
      dd.image = r2.Photo;
      dd.id = r2.Id;
      dd.profileUrl = r2.profileUrl;
      // let buff = btoa(JSON.stringify(dd));
      this.gitService.setLoggedInGitDev(dd);
      this.hookFail = false;
      if (this.bGetFromGit) {
        this.messages.push('Please wait, getting Org List ...');
      }
      this.gitService.getOrgList(this.bGetFromGit, this.bGetFromGit).subscribe(
        r1 => {
          if (r1.length > 0) {
            this.orgStatus = true;
            this.orgList = r1;
            this.gitService.setCurrentOrg(this.orgList[0].Org); //setting the default
            if (this.bGetFromGit) {
              this.successMessages.push(`Yes! Found ${r1.length} orgnization for this login`);
            }
            //for every org check the hook
            this.orgList.forEach(element => {
              if (this.bGetFromGit) {
                this.messages.push('Checking Git Gator hook in ' + element.Org);
              }
              this.gitService.getHookStatus(element.Org).subscribe(r3 => {
                let hookStatus = r3.val;
                if (!hookStatus) {
                  //lets install the hook
                  if (this.bGetFromGit) {
                    this.messages.push('Installing web hook in ' + element.Org);
                  }
                  this.gitService.setupWebHook(element.Org).subscribe(r4 => {
                    let hookReturn = r4.val;
                    if (hookReturn === 201) {
                      if (this.bGetFromGit) {
                        this.successMessages.push('Git Gator hook is installed for org ' + element.Org);
                      }
                    } else {
                      if (hookReturn === 422) {
                        if (this.bGetFromGit) {
                          this.messages.push('Git Gator hook is already installed for org ' + element.Org);
                        }
                      } else {
                        if (hookReturn === 404) {
                          if (this.bGetFromGit) {
                            this.errMessages.push("Couldn't install Git Gator hook. Please install manually for org: " + element.Org);
                            this.hookFail = true;
                          }
                        }
                      }
                    }
                  });
                } else {
                  if (this.bGetFromGit) {
                    this.messages.push('Git Gator hook is already installed in ' + element.Org);
                  }
                }
              });
              //Get Repos
              if (this.bGetFromGit) {
                this.messages.push('Please Wait! Getting Repositories for ' + element.Org);
              }
              this.gitService.getRepoList(element.Org, this.bGetFromGit, this.bGetFromGit).subscribe(
                r5 => {
                  //TODO: Turn the result into true and false
                  if (r5.length > 0) {
                    this.repoStatus = true;
                    this.repoCount = r5.length;
                    if (this.bGetFromGit) {
                      this.successMessages.push('Found Repositories: ' + r5.length + ' for ' + element.Org);
                    }
                  } else {
                    if (this.bGetFromGit) {
                      this.warningMessages.push('No Repositories found for organization: ' + element.Org);
                    }
                  }
                },
                error => {
                  this.errMessages.push('Sorry, seems like something is wrong getting repository list. Please refresh the page. ');
                  this.errMessages.push(error.statusText);
                  clearTimeout(t);
                },
              );
              if (this.bGetFromGit) {
                this.messages.push('Getting last 10 pull request from all repositories for ' + element.Org + ' Please wait ..');
              }

              //Get Pull Request
              this.gitService.getPullRequest(element.Org, this.bGetFromGit, this.bGetFromGit).subscribe(
                r6 => {
                  //TODO: Turn the result into true and false
                  if (this.bGetFromGit) {
                    this.successMessages.push('Done! Getting pull request for ' + element.Org + ' from ' + r6 + ' repositories');
                  }
                  this.buttonDisabled = false;
                  let elem = document.getElementById('myBar');
                  elem.style.width = '100%';
                  clearTimeout(t);
                  //Just firing an extra call to prepare the cache in BE
                  this.gitService.getGitTopDevelopers(this.gitService.getCurrentOrg(), this.NO_OF_DAYS);
                  //  this.router.navigate(['/dashboard']);  //No Need for user to click
                },
                error => {
                  if (this.bGetFromGit) {
                    this.errMessages.push('Sorry, seems like something is wrong getting PR. Please refresh the page. ');
                    this.errMessages.push(error.statusText);
                  }
                  clearTimeout(t);
                },
              );
            }); //org list loop
          } else {
            if (this.bGetFromGit) {
              this.warningMessages.push('Did not get any orgnazation for this login. Please check in Git and make sure you belong to an organization.');
              this.warningMessages.push('Exiting!!!');
            }
            let elem = document.getElementById('myBar');
            elem.style.width = '100%';
            clearTimeout(t);
          }
        },
        error => {
          if (this.bGetFromGit) {
            this.errMessages.push('Sorry, seems like something is wrong. Please refresh the page. Please feel free to send us message at support@anziosystems.com ');
            this.errMessages.push(error.message);
          }
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
