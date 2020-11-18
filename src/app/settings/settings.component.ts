import {Component, EventEmitter, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private gitService: GitService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
  ) {}

  ngOnInit() {
    let currentDev = this.gitService.getCurrentDev();
    //Get the Admin from DB
    // this.gitService.getAdmins().subscribe(admins => {
    //   if (!admins.find(currentDev)) {
    //     alert('For admin eyes only. Please send the mail to admin@Dev Star.com');
    //     this.router.navigate(['/dashboard']);
    //   }
    // });
  }
}
