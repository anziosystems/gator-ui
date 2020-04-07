import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, location: Location, private gitService: GitService, @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService) {
    this.sessionStorage.set('LBC', true);
  }

  ngOnInit() {
    this.sessionStorage.set('LBC', true);
  }

  login() {
    const authURL = this.gitService.gatorApiUrl + '/auth/github?callbackUrl=' + location.origin + '/callback';

    //this.router.navigateByUrl(authURL);
    window.location.href = authURL;
  }

  onChange(isChecked: boolean) {
    this.sessionStorage.set('LBC', isChecked);
  }
}
