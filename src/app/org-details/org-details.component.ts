import {Component, OnInit, ViewEncapsulation, EventEmitter, Inject, Output, Injectable, ViewChild, AfterViewInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, DevDetails} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {TreeNode} from 'primeng/api';
import {ChildActivationEnd} from '@angular/router';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
@Component({
  selector: 'app-org-details',
  templateUrl: './org-details.component.html',
  styleUrls: ['./org-details.component.less'],
  // encapsulation: ViewEncapsulation.Emulated,
})
export class OrgDetailsComponent implements OnInit {
  data: TreeNode[];
  selectedPerson: TreeNode;
  isShowDetail: boolean = false;
  isJiraShowDetail: boolean = false;
  currentOrg: string;
  alertmsgs = [];
  constructor(
    private gitService: GitService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,

    private router: Router,
  ) {
    this.gitService.getCurrentOrg().then(r => {
      this.currentOrg = r;
      if (!this.currentOrg) {
        this.router.navigate(['/lsauth']);
        return;
      }
    });

    //Just a fire so it is getting filled - THIS WILL NEVER BE FIRED Till you do somethng with the promise

    this.gitService.fillUserMap4CurrentOrg().then(x => {
      console.log('[I] FillGitUserMap is filled.');
    });
  }

  ngOnInit() {
    this.gitService.getCurrentOrg().then(r => {
      this.currentOrg = r;
      if (!this.currentOrg) {
        this.router.navigate(['/lsauth']);
        return;
      }
    });

    let token = this.storage.get('OrgToken');
    if (!token) {
      //TODO: goto right login
      this.router.navigate(['/lsauth']);
      return;
    }

    this.gitService.triggerIsLoggedIn(true);

    this.gitService.onGlobalComponentMessage.subscribe((val: string) => {
      if (val === 'CLOSE_PULL_DETAILS') {
        this.isShowDetail = false;
      }
      if (val === 'SHOW_PULL_DETAILS') {
        this.isShowDetail = true;
        this.isJiraShowDetail = false;
      }

      if (val === 'CLOSE_JIRA_DETAILS') {
        this.isJiraShowDetail = false;
      }
      if (val === 'SHOW_JIRA_DETAILS') {
        this.isJiraShowDetail = true;
        this.isShowDetail = false;
      }
      if (val === 'SHOW_OD') {
        this.gitService.getCurrentOrg().then(x => {
          this.gitService.getLoggedInUSerDetails().subscribe ( p => 
          this.gitService.getOrgTree(x, p.Login, false).subscribe(x => {
            this.data = x;
          }));
        });
      }
    });
  }

  nodeSelect(obj) {
    let d = new DevDetails();
    d.Login = obj.node.data;
    d.name = obj.node.label;
    
    this.gitService.getDevDetails4Login(d.Login).then(x => {
      this.GetData(x);
    });
  }

  gitData2() {
    this.gitService.setCurrentContext('GIT');
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    //this.gitService.trigger(this.gitService.getCurrentDev().login);
    this.gitService.broadcastDevLoginId(this.gitService.getCurrentDev());
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
  }

  jiraData2() {
    const date = new Date();
    this.gitService.setCurrentContext('JIRA');
    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});

    this.gitService.broadcastJiraDevName(this.gitService.getCurrentDev());
    this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
  }
  gitData(developer: DevDetails) {
    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    this.gitService.setCurrentDev(developer);
    //this.gitService.trigger(developer.login);
    this.gitService.broadcastDevLoginId(developer);
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
    this.isShowDetail = true;
  }

  jiraData(developer: DevDetails) {
    this.gitService.setCurrentDev(developer);
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //
    // if (!this.storage.get('JiraToken')) {
    //   this.router.navigate(['/jira-login']);
    //   return;
    // }

    this.gitService.broadcastJiraDevName(developer);
    this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
  }

  //selectedDev: string;
  GetData(dev: DevDetails) {
    if (this.gitService.getCurrentContext() === 'undefined') this.gitService.setCurrentContext('GIT');
    // this.selectedDev = dev.GitLogin;
    if (this.gitService.getCurrentContext() === 'JIRA') {
      this.jiraData(dev);
    } else {
      this.gitData(dev);
    }
  }
}
