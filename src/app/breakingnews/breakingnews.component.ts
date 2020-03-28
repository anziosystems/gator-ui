import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {timeInterval} from 'rxjs/operators';
import {getLocaleDateTimeFormat} from '@angular/common';
import {GitService} from '../git-service';

@Component({
  selector: 'app-breakingnews',
  templateUrl: './breakingnews.component.html',
  styleUrls: ['./breakingnews.component.less'],
})
export class BreakingnewsComponent implements OnInit {
  breakingNews: string;
  timer;
  ctr = 0;
  devDetails: any[];
  login;
  repo;
  desc;
  pullReqUrl;
  constructor(public cd: ChangeDetectorRef, private gitService: GitService) {}

  ngOnInit() {
    this.updateBreakingNews();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  getData(): Promise<boolean> {
    return new Promise((done, fail) => {
      this.gitService.ready().then(result => {
        this.gitService.getDeveloperDetail(this.gitService.getCurrentOrg(), 7, null, null, 50).subscribe(val => {
          this.devDetails = val;
          this.devDetails.map(v => {
            let s = v.pullrequesturl;
            s = s.replace('https://api.github.com/repos', 'https://github.com');
            s = s.replace('pulls', 'pull');
            s = s.replace('comments', ' ');
            v.pullrequesturl = s;
            v.body = v.body.replace(/\+/g, ' ');
            v.title = v.title.replace(/\+/g, ' ');
            done(true);
          });
        });
      });
    });
  }

  updateBreakingNews() {
    this.breakingNews = 'Please wait ...Breaking news will appear here..';
    this.getData().then(() => {
      this.timer = setInterval(() => {
        this.ctr = this.ctr + 1;
        if (!this.devDetails) return;
        if (this.ctr > this.devDetails.length - 1) {
          this.ctr = 0;
          this.getData();
        }
        this.login = this.devDetails[this.ctr].Login;
        this.gitService.getGitDisplayName4Login(this.login).then(r => {
          this.login = r;
          this.repo = this.devDetails[this.ctr].Repo;
          this.desc = this.devDetails[this.ctr].title;
          this.pullReqUrl = this.devDetails[this.ctr].pullrequesturl;
          this.breakingNews = `${this.desc} - ${this.login} - ${this.repo}`;
          this.cd.detectChanges();
        });
      }, 8000);
    });
  }
}
