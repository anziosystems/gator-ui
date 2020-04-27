import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-lsauth',
  templateUrl: './lsauth.component.html',
  styleUrls: ['./lsauth.component.less'],
})
export class LsauthComponent implements OnInit {
  constructor(private router: Router, location: Location, private gitService: GitService, @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService) {}

  ngOnInit(): void {}

  login() {
    const authURL = this.gitService.gatorApiUrl + '/auth/lsauth?callbackUrl=' + location.origin + '/lsauthCallback';
    window.location.href = authURL;
  }

  onChange(isChecked: boolean) {
    this.sessionStorage.set('LBC', isChecked);
  }
  
}
