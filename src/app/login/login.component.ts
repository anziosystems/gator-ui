import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {routerNgProbeToken} from '@angular/router/src/router_module';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, location: Location, private gitService: GitService) {}

  ngOnInit() {}

  login() {
    const authURL = this.gitService.gatorApiUrl + '/auth/github?callbackUrl=' + location.origin + '/callback';
    window.location.href = authURL;
  }

  Jiralogin() {
    const authURL = this.gitService.gatorApiUrl + '/auth/atlassian?callbackUrl=' + location.origin + '/callback';
    window.location.href = authURL;
  }

}
