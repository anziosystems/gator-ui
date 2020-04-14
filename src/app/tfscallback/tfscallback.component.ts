import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'ngx-webstorage-service';
@Component({
  selector: 'app-tfscallback',
  templateUrl: './tfscallback.component.html',
  styleUrls: ['./tfscallback.component.less'],
})
export class TfscallbackComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private gitService: GitService, private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      const JiraToken = params['TFSToken'];
      if (JiraToken) {
        this.gitService.setJiraToken(JiraToken);
        this.storage.set('TFSToken', JiraToken);
        this.gitService.broadcastGlobalComponentMessage('SHOW_TFS_DETAILS');
        this.router.navigate(['/tfsStatus']);
      }
    });
  }

  ngOnInit(): void {}
}
