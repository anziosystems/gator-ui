import {Component, OnInit, Inject} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import {GitService} from '../git-service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.less'],
})
export class SignupComponent implements OnInit {
  constructor(private router: Router, private gitService: GitService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // let token = this.route.snapshot.paramMap.get('token');
    // if (token) {
    //   this.gitService.signup(token);
    // }
  }

  Go() {
    const authURL = `${this.gitService.gatorApiUrl}/auth/lsauth/anzio?callbackUrl=${location.origin}/lsauthCallback`;
    let token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.gitService.signup(token).subscribe(x => {
        window.location.href = authURL;
      });
    } else {
      window.location.href = authURL;
    }
  }
}
