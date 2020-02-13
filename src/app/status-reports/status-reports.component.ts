import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import {DialogService} from 'primeng/api';
import * as FileSaver from 'file-saver';

import {PeopleTicketComponent} from '../people-ticket/people-ticket.component';
import {filter} from 'rxjs/internal/operators/filter';
const _ = require('lodash');

@Component({
  selector: 'app-status-reports',
  templateUrl: './status-reports.component.html',
  styleUrls: ['./status-reports.component.less'],
})
export class StatusReportsComponent implements OnInit {
  srList: any[];
  srReviewList: any[];
  textReviewer: string = '';
  textStatus: string = '';
  bShowReviewers: number = -1;
  bShowGitPR: number = -1;
  bShowJira: number = -1;
  currentOrg: string;
  eventSub: any;
  srId: number = -1; //Has to be -1 to be a insert else it will be update
  manager: string;
  managerComment: string;
  managerStatus: number;
  status: number;
  quillDisable: boolean = true;
  bInReview: boolean = false;
  bClosedReport: boolean = false;
  bNoSave: Boolean = true;
  bNoSendBack: Boolean = true;
  prevStatus: number = 0;
  comingFromStatusReportWindow: boolean = false;
  quillManagerDisable: boolean = false;
  //status -- 1=inProgress, 2=InReviw, 3=closed 4=Rejected 5=Archived
  IN_PROGRESS: number = 1;
  IN_REVIEW: number = 2;
  CLOSED: number = 3;
  REJECTED: number = 4;
  ARCHIVED: number = 5;
  DELETE: number = 6;
  ALL: number = 99;
  author: string;
  ACHIEVED: number = 3;
  NEEDIMPROVEMENT: number = 1;
  EXCEED: number = 7;

  constructor(private gitService: GitService, private router: Router, private cdRef: ChangeDetectorRef, private dialogService: DialogService) {
    this.currentOrg = this.gitService.getCurrentOrg();
    let loggedInUser =  this.gitService.getLoggedInGitDev().login;
    if (!loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.textReviewer = '';
    this.textStatus = '';
    this.quillManagerDisable = true;
  }

  ngOnInit() {
    if (!this.currentOrg) {
      //org is empty, we must go back to dash board and let them choose the org
      this.gitService.checkOrg();
      this.currentOrg = this.gitService.getCurrentOrg();
    }
    this.status = this.IN_PROGRESS;
    this.srId = -1;
    this.currentOrg = this.gitService.getCurrentOrg();
    this.srList = [];
    this.srReviewList = [];

    this.textStatus = '';
    this.textReviewer = '';
    this.getReports4User();
    this.quillDisable = false;

    // //this bring clicks on topdeveloper component to reviewer text box
    this.eventSub = this.gitService.onCustomEvent.subscribe((val: CustomEvent) => {
      //   if (val.source === 'TOP-DEVELOPER') {
      //     if (val.destination === 'STATUS-REPORT') {
      //       if (this.textReviewer.length > 100) {
      //         alert('enough');
      //         return;
      //       }
      //       this.textReviewer = this.textReviewer + val.message + ',';
      //     }
      //   }
      //this is to get the git tickets in report
      if (val.source === 'GIT') {
        if ((val.destination = 'STATUS-REPORT')) this.textStatus = val.message + ' <br /> ' + this.textStatus;
      }
      //this is to geet the Jira tickets in report
      if (val.source === 'JIRA') {
        if ((val.destination = 'STATUS-REPORT')) this.textStatus = val.message + ' <br /> ' + this.textStatus;
      }
    });
  }

  //When review listbox is clicked
  getReportData4Review(id: number) {
    //hide submit button and show close in its place
    this.bInReview = true;
    this.comingFromStatusReportWindow = false;
    this.quillManagerDisable = false;
    this.getReportForId(id);
  }

  //When report list box is clicked
  getReportData(id: number) {
    this.comingFromStatusReportWindow = true;
    this.bInReview = false;
    this.quillManagerDisable = true;
    this.getReportForId(id);
  }

  reset() {
    this.srId = -1;
    this.status = this.IN_PROGRESS;
    this.currentOrg = this.currentOrg;
    this.textStatus = '';
    this.textReviewer = '';
    this.manager = '';
    this.managerComment = '';
    this.managerStatus = this.ACHIEVED;
    this.quillDisable = false;
    this.author = this.gitService.getLoggedInGitDev().login;
    this.bInReview = false;
    this.comingFromStatusReportWindow = false;
    this.bClosedReport = false;
    this.quillManagerDisable = true;
  }

  newReport() {
    this.reset();
    alert('Please type your MSR below. After the report is written please add reviewer and submit.');
  }

  getReportForId(id: number) {
    const self = this;
    this.gitService.getSR4Id(id, true).subscribe(val => {
      if (!val) {
        console.log('getSR4Id did not get any data.');
        return;
      }
      self.srId = val[0].SRId;
      this.author = val[0].UserId;
      self.status = val[0].Status;
      self.prevStatus = self.status;
      self.currentOrg = val[0].Org;
      self.textStatus = val[0].StatusDetails;
      self.textReviewer = val[0].Reviewer;
      self.manager = val[0].Manager;
      self.managerComment = val[0].ManagerComment;
      if (val[0].ManagerStatus === null) val[0].ManagerStatus = this.ACHIEVED;
      self.managerStatus = val[0].ManagerStatus;
      self.bNeed = self.managerStatus === this.NEEDIMPROVEMENT;
      self.bExceed = self.managerStatus === this.EXCEED;
      self.bAchieved = self.managerStatus === this.ACHIEVED;
      self.quillDisable = self.status === self.IN_REVIEW || self.status === self.CLOSED || self.status === self.ARCHIVED;
      if (self.status === self.ARCHIVED || self.status === self.CLOSED) {
        self.bClosedReport = true;
      } else {
        self.bClosedReport = false;
      }
      if (self.status === self.IN_REVIEW) {
        self.bInReview = true;
        if (self.comingFromStatusReportWindow) {
          //it is in review and the user is seeing his own status report. He should not be able to save it or send back
          self.bNoSave = true;
          self.bNoSendBack = true;
        } else {
          self.bNoSave = false;
          self.bNoSendBack = false;
        }
      } else {
        self.bInReview = false;
      }
    });
  }

  getReports4User() {
    this.srList = [];
    this.srReviewList = [];
    this.quillDisable = false;
    this.gitService.getSR4User(this.gitService.getLoggedInGitDev().login, true).subscribe(val => {
      val.map(item => {
        //status -- 1=inProgress, 2=InReviw, 3=closed 4=Rejected 5=Archived
        switch (item.Status) {
          case 1:
            item.Status = 'In Progress';
            break;
          case 2:
            item.Status = 'In Review';
            break;
          case 3:
            item.Status = 'Closed';
            break;
          case 4:
            item.Status = 'Rejected';
            break;
          case 5:
            item.Status = 'Archived';
            break;
        }

        //item.LastUpdated = item.LastUpdated.substring(0, 10);
        item.ReportDate = item.ReportDate.substring(0, 10);
        this.srList.push(item);
      });
    });

    this.getReviewReports(this.IN_REVIEW);
  }

  getReviewReports(status: number) {
    this.srReviewList = [];
    //review reports
    this.gitService
      .GetSR4User4Review(
        this.gitService.getLoggedInGitDev().login,
        status, //inreview
        true,
      )
      .subscribe(val => {
        val.map(x => {
          //status -- 1=inProgress, 2=InReviw, 3=closed 4=Rejected 5=Archived
          switch (x.Status) {
            case 1:
              x.Status = 'In Progress';
              break;
            case 2:
              x.Status = 'In Review';
              break;
            case 3:
              x.Status = 'Closed';
              break;
            case 4:
              x.Status = 'Rejected';
              break;
            case 5:
              x.Status = 'Archived';
              break;
          }
          //x.LastUpdated = x.LastUpdated.substring(0, 10);
          x.ReportDate = x.ReportDate.substring(0, 10);
          this.srReviewList.push(x);
        });
      });
  }
  //Show all the reports for the reviewer -
  showAllReview() {
    this.getReviewReports(this.ALL);
  }

  addReviewer() {
    this.gitService.ready().then(result => {
      this.gitService.getGitDev4Org(this.gitService.getCurrentOrg()).subscribe(val => {
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

  addJiraTickets() {
    this.gitService.setCurrentContext('JIRA');
    this.gitService.triggerCustomEvent({
      source: 'STATUS-REPORT',
      destination: 'JIRA',
      message: 'true',
    });
    this.gitService.triggerJira(this.gitService.getLoggedInGitDev().login);
    this.bShowJira = 99;
  }

  save(status: number) {
    if (this.textStatus.trim() === '') {
      if (confirm('Please fill in status first')) {
        return;
      }
    }

    if (this.textReviewer.trim() === '') {
      if (confirm('Please add your manager as a reviewer.')) {
        return;
      }
    }

    if (!this.currentOrg) {
      alert('Please select an organization before you submit the report.');
      return;
    }

    if (!status) {
      status = this.status;
    }

    if (this.prevStatus === this.IN_PROGRESS) {
      //if it is coming from In_progress then let it go
    } else {
      if (this.comingFromStatusReportWindow && this.status === this.IN_REVIEW) {
        alert('Report is In-Review, you cannot edit it. Ask your reviewer to send it back to you to edit it.');
        return;
      }
    }

    if (this.status === this.IN_PROGRESS) {
      if (!this.author) {
        //dont just blindly update the autor, some time reviewer is looking at the In_Progress reports
        //to, as he is mentioned in the reviewer field.
        this.author = this.gitService.getLoggedInGitDev().login;
      }
    }

    this.managerStatus = this.bAchieved ? this.ACHIEVED : this.bNeed ? this.NEEDIMPROVEMENT : this.bExceed ? this.EXCEED : this.ACHIEVED;

    this.gitService
      .saveMSR(
        this.srId,
        this.author,
        this.currentOrg,
        this.textStatus,
        this.textReviewer,
        status, //status -- 1=inProgress, 2=InReviw, 3=closed 4=Rejected 5=Archived
        '', //links
        this.manager,
        this.managerComment,
        this.managerStatus,
      )
      .subscribe(v => {
        console.log(v);
        // this.getReports4User(); //No need to reset the list box review list box
        alert('Your Report is saved.');
        this.reset();
      });
  }

  submit() {
    if (this.author === this.gitService.getLoggedInGitDev().login) {
      if (this.status === this.IN_REVIEW) {
        alert('This report is already submitted');
        return;
      }
    }
    if (confirm('Once you submit you can not edit the report afterwards.')) {
      this.save(this.IN_REVIEW);
    }
  }

  delete() {
    if (this.status === this.IN_PROGRESS) {
      if (confirm('Are you sure? You want to delete this report?.')) {
        this.gitService
          .saveMSR(
            this.srId,
            this.author,
            this.currentOrg,
            '',
            '',
            this.DELETE,
            '', //links
            this.manager,
            this.managerComment,
            this.managerStatus,
          )
          .subscribe(v => {
            console.log(v);
            this.getReports4User();
            this.reset();
          });
      }
    } else {
      alert('You can delete only reports which are in-progress status.');
    }
  }

  close() {
    if (this.comingFromStatusReportWindow && this.status === this.IN_REVIEW) {
      alert('You cannot close this report. Report has to be in Review to be closed. Add Reviewer and ask them to close this report.');
      return;
    }

    if (confirm('Once you submit you can not edit the report afterwards.')) {
      this.save(this.CLOSED);
    }
  }

  refresh() {
    this.getReports4User();
  }

  sendBack() {
    if (this.comingFromStatusReportWindow && this.status === this.IN_REVIEW) {
      alert('You cannot send this report back. Only receiver can send back the report.');
      return;
    }
    this.status = this.IN_PROGRESS; //Go back to start
    this.gitService
      .saveMSR(
        this.srId,
        this.author,
        this.currentOrg,
        this.textStatus,
        this.textReviewer,
        this.status, //status -- 1=inProgress, 2=InReviw, 3=closed 4=Rejected 5=Archived
        '', //links
        this.manager,
        this.managerComment,
        this.managerStatus,
      )
      .subscribe(v => {
        console.log(v);
        this.getReports4User();
        alert('Report is send back');
        this.reset();
      });
  }

  addGitPR() {
    this.gitService.setCurrentContext('GIT');
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

  bAchieved: boolean = true;
  bExceed: boolean = false;
  bNeed: boolean = false;

  achieved() {
    this.bAchieved = true;
    this.bExceed = false;
    this.bNeed = false;
  }

  exceed() {
    this.bAchieved = false;
    this.bExceed = true;
    this.bNeed = false;
  }

  need() {
    this.bAchieved = false;
    this.bExceed = false;
    this.bNeed = true;
  }

  downloadPDF() {
    const PDF_TYPE = 'application/pdf';
    const PDF_EXTENSION = '.pdf';
    const byteCharacters = atob(btoa(this.textStatus + '<br /> ------------- Manager Comment ---------------<br />' + this.managerComment));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: PDF_TYPE});

    FileSaver.saveAs(blob, 'MSR-' + new Date().getDay() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getFullYear() + '.html');
  }
}
