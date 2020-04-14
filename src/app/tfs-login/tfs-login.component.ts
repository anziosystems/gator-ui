import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';

@Component({
  selector: 'app-tfs-login',
  templateUrl: './tfs-login.component.html',
  styleUrls: ['./tfs-login.component.less']
})
export class TfsLoginComponent implements OnInit {

  constructor(private router: Router, location: Location, private gitService: GitService    )
   { }

  ngOnInit(): void {
  }

  tfslogin() {
    const authURL = this.gitService.gatorApiUrl + '/auth/tfs?callbackUrl=' + location.origin + '/tfsCallback';
    window.location.href = authURL;
  }
}
