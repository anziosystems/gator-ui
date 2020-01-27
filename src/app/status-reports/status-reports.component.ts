import {Component, OnInit, EventEmitter, Output, Inject, NgModule, ChangeDetectorRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GitService, CustomEvent} from '../git-service';
import {Route} from '@angular/compiler/src/core';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';

@Component({
  selector: 'app-status-reports',
  templateUrl: './status-reports.component.html',
  styleUrls: ['./status-reports.component.less'],
})
export class StatusReportsComponent implements OnInit {
  srList: any[];
  textReviewer: string = '';
  textStatus: string = '';
  bShowReviewers: number = -1;
  bShowGitPR: number = -1;
  bShowJira: number = -1;
  currentOrg: string;
  eventSub: any;
  constructor(private gitService: GitService, private router: Router, private cdRef: ChangeDetectorRef) {
    this.currentOrg = this.gitService.currentOrg;
    this.textReviewer = '';
    this.textStatus = '';
  }

  ngOnInit() {
    this.currentOrg = this.gitService.currentOrg;
    this.srList = [];
    this.srList.push('12/30/2019');
    this.srList.push('11/30/2019');
    this.srList.push('10/30/2019');
    this.srList.push('09/30/2019');
    this.srList.push('08/30/2019');
    this.srList.push('07/30/2019');
    this.srList.push('06/30/2019');
    this.srList.push('05/30/2019');
    this.srList.push('04/30/2019');
    this.textStatus = '';
    this.textReviewer = '';
    // this.gitService.onMyEvent.subscribe((val: string) => {
    //   this.textReviewer = this.textReviewer + val + ',';
    // });

    this.eventSub = this.gitService.onCustomEvent.subscribe((val: CustomEvent) => {
      if (val.source === 'TOP-DEVELOPER') {
        if (val.destination === 'STATUS-REPORT') {
          this.textReviewer = this.textReviewer + val.message + ',';
        }
      }

      if (val.source === 'GIT') {
        if ((val.destination = 'STATUS-REPORT')) this.textStatus = val.message + '\n' + this.textStatus;
      }

      if (val.source === 'JIRA') {
        if ((val.destination = 'STATUS-REPORT')) this.textStatus = val.message + '\n' + this.textStatus;
      }
    });
  }

  addReviewer() {
    this.bShowReviewers = 99;
  }

  addJiraTickets() {
    this.gitService.triggerCustomEvent({
      source: 'STATUS-REPORT',
      destination: 'JIRA',
      message: 'true',
    });
    this.gitService.triggerJira(this.gitService.loggedInGitDev.login);
    this.bShowJira = 99;
  }

  addGitPR() {
    this.gitService.triggerCustomEvent({
      source: 'STATUS-REPORT',
      destination: 'TOP-DEVELOPER',
      message: 'true',
    });
    let dev = this.gitService.getLoggedInGitDev();
    this.gitService.trigger(dev.login);
    this.bShowGitPR = 99;
  }

  comingSoon() {
    alert('Coming soon ...');
  }

  onDestroy() {
    this.eventSub.unsubscribe();
    this.cdRef.detach();
  }

  hide() {
    this.bShowReviewers = -1;
    this.bShowGitPR = -1;
    this.bShowJira = -1;
  }
}
