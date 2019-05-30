import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.less'],
})
export class CallbackComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private gitService: GitService, private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.gitService.token = token;
        this.storage.set('token', token);
        this.sleep(800).then ( res => {
          this.router.navigate(['/status'])
        });
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit() {}
}
