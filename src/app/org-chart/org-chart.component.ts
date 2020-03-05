import {Component, OnInit, ChangeDetectorRef, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import {DialogService} from 'primeng/api';
import * as FileSaver from 'file-saver';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {PeopleTicketComponent} from '../people-ticket/people-ticket.component';
import {filter} from 'rxjs/internal/operators/filter';
const _ = require('lodash');

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.less']
})
export class OrgChartComponent implements OnInit {
  textReviewer: string = '';
  currentOrg: string;
  textStatus: string = '';


  constructor(    private gitService: GitService,
    private router: Router,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService) { 
      this.currentOrg = this.gitService.getCurrentOrg();
    if (!this.currentOrg) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.gitService.getLoggedInGitDev()) {
      this.router.navigate(['/login']);
      return;
    }

    let loggedInUser = this.gitService.getLoggedInGitDev().login;
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.textReviewer = '';
    }

  ngOnInit() {
  }

  addDeveloper() {
    this.gitService.ready().then(result => {
      this.gitService.getGitDev4Org(this.gitService.getCurrentOrg()).subscribe(val => {
        if (val) {
          if (val.code === 404) {
            sessionStorage.setItem ('statusText', this.textStatus);
            this.router.navigate(['/login']);
          }
        }
        const devs = val.map(item => item.Name + '--' + item.login + '--' + item.AvatarUrl).filter((value, index, self) => self.indexOf(value) === index);
        const developerNames = devs.map(item => {
          const arr = _.split(item, '--');
          if (arr[0] === 'null' || arr[0] === undefined) arr[0] = arr[1]; //some time there is no Name
          return arr[0] + '  -  ' + arr[1];
        });

        this.dialogService
          .open(PeopleTicketComponent, {
            data: {
              options: developerNames,
              items: this.textReviewer.split(', ').filter(x => x),
            },
            width: '50%',
            header: 'Choose Reviewers',
          })
          .onClose.pipe(filter(x => x))
          .subscribe(v => {
            this.textReviewer = v.join(', ');
          });
      });
    });
  }
}
