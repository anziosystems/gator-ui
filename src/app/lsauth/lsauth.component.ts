import {Component, OnInit, Inject} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {GitService} from '../git-service';
import {SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-lsauth',
  templateUrl: './lsauth.component.html',
  styleUrls: ['./lsauth.component.less'],
})
export class LsauthComponent implements OnInit {
  tenantName: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,

    location: Location,
    private gitService: GitService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let currentUrl = event.url;
        console.log(currentUrl);
      }
    });
  }

  ngOnInit(): void {
    this.tenantName = this.route.snapshot.paramMap.get('tenant');
    if (this.tenantName !== 'null') {
      if (this.gitService.tenantMap.has(this.tenantName)) {
        const authURL = `${this.gitService.gatorApiUrl}/auth/lsauth/${this.tenantName}?callbackUrl=${location.origin}/lsauthCallback`;
        window.location.href = authURL;
        return;
      }
      this.router.navigate(['/tenantq']);
      return;
    }

    // this.tenantName = 'anzio'; //only for testing
    // const authURL = `${this.gitService.gatorApiUrl}/auth/lsauth/${this.tenantName}?callbackUrl=${location.origin}/lsauthCallback`;
    // window.location.href = authURL;
  }

  login() {
    this.tenantName = 'anzio'; //only for testing
    const authURL = `${this.gitService.gatorApiUrl}/auth/lsauth/${this.tenantName}?callbackUrl=${location.origin}/lsauthCallback`;
    window.location.href = authURL;
  }

  onChange(isChecked: boolean) {
    this.sessionStorage.set('LBC', isChecked);
  }
}
