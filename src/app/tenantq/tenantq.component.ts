import {Component, OnInit, Inject} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {GitService} from '../git-service';

@Component({
  selector: 'app-tenantq',
  templateUrl: './tenantq.component.html',
  styleUrls: ['./tenantq.component.less'],
})
export class TenantqComponent implements OnInit {
  tenantName: string;
  tenantMap: any;
  errorMessage: string;
  message: string;

  constructor(private router: Router, private gitService: GitService) {}

  ngOnInit(): void {
    this.message = `Mostly tenants are domain name, if you'r org email is yourname@domain.com. domain will be your tenant name.`;
    this.errorMessage = ' ';
  }

  Go() {
    this.tenantName = this.tenantName.toLowerCase();
    if (this.gitService.tenantMap.has(this.tenantName)) {
      const authURL = `${this.gitService.gatorApiUrl}/auth/lsauth/${this.tenantName}?callbackUrl=${location.origin}/lsauthCallback`;
      window.location.href = authURL;
    } else {
      if (!this.tenantName) {
        this.errorMessage = `Invalid Tenant, If you don't know your tenant, please send a mail to support@gitgator.com`;
      } else {
        this.errorMessage = `${this.tenantName} is not found. If you don't know your tenant, please send a mail to support@gitgator.com`;
      }
    }
    //this.router.navigate([authURL]);
  }
}
