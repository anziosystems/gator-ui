import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {routerNgProbeToken} from '@angular/router/src/router_module';

@Component({
  selector: 'app-jira-login-in',
  templateUrl: './jira-login-in.component.html',
  styleUrls: ['./jira-login-in.component.less']
})
export class JiraLoginInComponent implements OnInit {

  constructor(private router: Router, location: Location, private gitService: GitService) { }

  ngOnInit() {
  }

  Jiralogin() {
    const authURL = this.gitService.gatorApiUrl + '/auth/atlassian?callbackUrl=' + location.origin + '/jiraCallback';
    window.location.href = authURL;
  }
}
