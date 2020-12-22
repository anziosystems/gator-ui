import {Component, OnInit, ChangeDetectorRef, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import * as FileSaver from 'file-saver';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {PeopleTicketComponent} from '../people-ticket/people-ticket.component';
import {filter} from 'rxjs/internal/operators/filter';
import {Message} from '@angular/compiler/src/i18n/i18n_ast';
import * as _ from 'lodash';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-connect-ids',
  templateUrl: './connect-ids.component.html',
  styleUrls: ['./connect-ids.component.less'],
})
export class ConnectIdsComponent implements OnInit {
  currentOrg: string;
  loggedInUser: string;
  userRoles: any[];
  allUsers: any[];
  gitUserName: string;
  jiraUserName: string;
  tfsUserName: string;
  selectedUserName: string;
  user: any;
  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.gitService.getCurrentOrg().then(r => {
      this.currentOrg = r;
      if (!this.currentOrg) {
        this.router.navigate(['/lsauth']);
        return;
      }
    });

    if (!this.gitService.getLoggedInDev()) {
      this.router.navigate(['/lsauth']);
      return;
    }
  }

  getUserids(user: any) {
    let u = this.allUsers.filter(function(value, index, arr) {
      return value.Email === user.Email;
    });
    this.user = u[0];
    this.selectedUserName = this.user.UserDisplayName;
    this.tfsUserName = this.user.TfsUserName;
    this.gitUserName = this.user.GitUserName;
    this.jiraUserName = this.user.JiraUserName;
  }

  ngOnInit() {
    if (!this.currentOrg) {
      //org is empty, we must go back to dash board and let them choose the org
      this.gitService.checkOrg().then(x => {
        if (x === 404) {
          this.router.navigate(['/lsauth']); //May be right login
        }
      });
    }
    this.gitService.getCurrentOrg().then(z => {
      this.currentOrg = z;
      this.gitService.getUser4Org(this.currentOrg).subscribe(r => {
        this.userRoles = [];
        let r2 = r.map(x => {
          x.Name = x.UserName;
          this.userRoles.push(x);
        });
      });
    });

    this.gitService.getUser4Org(this.currentOrg).subscribe(r => {
      this.allUsers = [];
      this.allUsers = r;
    });
  }

  alertmsgs = [];
  save() {
    this.user.TfsUserName = this.tfsUserName;
    this.user.GitUserName = this.gitUserName;
    this.user.JiraUserName = this.jiraUserName;
    this.gitService.getCurrentOrg().then(org => {
      this.gitService.updateUserConnectIds(this.user, org).subscribe(x => {
        this.alertmsgs.push({severity: 'success', summary: 'Record Updated', detail: ''});
      });
    });
  }
}
