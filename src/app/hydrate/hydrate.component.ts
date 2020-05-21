import {Component, OnInit, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-hydrate',
  templateUrl: './hydrate.component.html',
  styleUrls: ['./hydrate.component.less']
})
export class HydrateComponent implements OnInit {

  constructor(private router: Router, location: Location, private gitService: GitService, @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService) { }

  ngOnInit(): void {
  }

  gitLogin() {
    const authURL = this.gitService.gatorApiUrl + '/auth/github?callbackUrl=' + location.origin + '/callback';

    //this.router.navigateByUrl(authURL);
    window.location.href = authURL;
  }
}
