import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';

@Component({
  selector: 'app-bitbucket-login',
  templateUrl: './bitbucket-login.component.html',
  styleUrls: ['./bitbucket-login.component.less'],
})
export class BitbucketLoginComponent implements OnInit {
  constructor(private router: Router, location: Location, private gitService: GitService) {}

  ngOnInit() {}

  login() {
    const authURL = this.gitService.gatorApiUrl + '/auth/bitbucket?callbackUrl=' + location.origin + '/bitbucketCallback';
    window.location.href = authURL;
  }
}
