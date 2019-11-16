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
  constructor(public cd: ChangeDetectorRef, private gitService: GitService) {}

  ngOnInit() {
    this.updateBreakingNews();
  }

  getData (){
    this.gitService.ready().then(result => {
      this.gitService.getDeveloperDetail(this.gitService.currentOrg, 7, null, null, 50).subscribe(val => {
        this.devDetails = val;
        this.devDetails.map(v => {
          let s = v.pullrequesturl;
          s = s.replace('https://api.github.com/repos', 'https://github.com');
          s = s.replace('pulls', 'pull');
          s = s.replace('comments', ' ');
          v.pullrequesturl = s;
          v.body = v.body.replace(/\+/g, ' ');
          v.title = v.title.replace(/\+/g, ' ');
        });
      });
    });
  }

  updateBreakingNews() {
    this.breakingNews = 'Breaking news will come here..';
    this.getData();
    this.timer = setInterval(() => {
      this.ctr = this.ctr + 1;
      if (this.ctr > this.devDetails.length - 1)  {
        this.ctr = 0;
        this.getData();
      }
      this.login = this.devDetails[this.ctr].Login;
      this.repo = this.devDetails[this.ctr].Repo;
      this.desc = this.devDetails[this.ctr].title;
      this.breakingNews = `${this.login} - ${this.repo}: ${this.desc}`;
      this.cd.detectChanges();
    }, 5000);
  }
}
