import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-hydrate',
  templateUrl: './hydrate.component.html',
  styleUrls: ['./hydrate.component.less'],
})
export class HydrateComponent implements OnInit {
  constructor(private router: Router, location: Location, private gitService: GitService, @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService) {}

  ngOnInit(): void {}

  async gitLogin() {
    let loggedUser = this.gitService.getLoggedInDev().Login;
    let currentOrg = await this.gitService.getCurrentOrg();
    this.gitService.isUserAdmin(currentOrg, loggedUser).subscribe(x => {
      if (x === 0) {
        alert('Sorry, only admin can see this');
      } else {
        const authURL = this.gitService.gatorApiUrl + '/auth/github?callbackUrl=' + location.origin + '/callback';
        window.location.href = authURL;
      }
    });
  }

  async jiraLogin() {
    let loggedUser = this.gitService.getLoggedInDev().Login;
    let currentOrg = await this.gitService.getCurrentOrg();
    this.gitService.isUserAdmin(currentOrg, loggedUser).subscribe(x => {
      if (x === 0) {
        alert('Sorry, only admin can see this');
      } else {
        this.router.navigate(['/jira-login']);
      }
    });
  }

  async tfsLogin() {
    let loggedUser = this.gitService.getLoggedInDev().Login;
    let currentOrg = await this.gitService.getCurrentOrg();
    this.gitService.isUserAdmin(currentOrg, loggedUser).subscribe(x => {
      if (x === 0) {
        alert('Sorry, only admin can see this');
      } else {
        this.router.navigate(['/tfs-login']);
      }
    });
  }
}
