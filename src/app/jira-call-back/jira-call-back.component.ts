import {Component, OnInit, Inject} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {GitService} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {timer} from 'rxjs';
@Component({
  selector: 'app-jira-callback',
  templateUrl: './jira-call-back.component.html',
  styleUrls: ['./jira-call-back.component.less'],
})
export class JiraCallBackComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private gitService: GitService, private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    this.activatedRoute.queryParams.subscribe(params => {
      const JiraToken = params['JiraToken'];
      if (JiraToken) {
        this.gitService.setJiraToken(JiraToken);
        this.storage.set('JiraToken', JiraToken);
        this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
        this.router.navigate(['/jiraStatus']);
      }
    });
  }

  ngOnInit() {}
}
