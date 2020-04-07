import {Component, OnInit, ChangeDetectorRef, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {GitService, CustomEvent, DevDetails} from '../git-service';
import * as FileSaver from 'file-saver';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {PeopleTicketComponent} from '../people-ticket/people-ticket.component';
import {filter} from 'rxjs/internal/operators/filter';
import {Message} from '@angular/compiler/src/i18n/i18n_ast';
const _ = require('lodash');
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicDialog';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less'],
})
export class AdminComponent implements OnInit {
  currentOrg: string;
  loggedInUser: string;
  userRoles: any[];
  allUsers: any[];
  constructor(
    private gitService: GitService,
    private router: Router,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.currentOrg = this.gitService.getCurrentOrg();
    if (!this.currentOrg) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.gitService.getLoggedInGitDev()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loggedInUser = this.gitService.getLoggedInGitDev().login;
    if (!this.loggedInUser) {
      this.router.navigate(['/login']);
      return;
    }
  }

  moveAdmin2User(u: any) {
    this.userRoles = this.userRoles.filter(function(value, index, arr) {
      return value !== u;
    });
    this.allUsers.push(u);
    this.deleteUserRole(u.login);
  }

  moveUser2Admin(u: any) {
    //remove from allUsers
    this.allUsers = this.allUsers.filter(function(value, index, arr) {
      return value !== u;
    });
    //Add to admin list
    this.userRoles.push(u);
    this.save(u.login);
  }

  ngOnInit() {
    if (!this.currentOrg) {
      //org is empty, we must go back to dash board and let them choose the org
      this.gitService.checkOrg();
      this.currentOrg = this.gitService.getCurrentOrg();
    }

    this.gitService.getRole4Org(this.currentOrg).subscribe(r => {
      this.userRoles = [];
      let r2 = r.map(x => {
        this.gitService.getGitDisplayName4Login(x.login).then(z => {
          x.Name = z;
          this.userRoles.push(x);
        });
      });
    });

    this.gitService.getGitDev4Org(this.currentOrg).subscribe(r => {
      this.allUsers = [];
      this.allUsers = r;
    });
  }

  alertmsgs = [];
  save(login: string) {
    this.gitService.saveUserRole(login, this.currentOrg, 'Admin').subscribe(x => {
      if (x) {
        if (x.code === 401) {
          this.alertmsgs.push({severity: 'error', summary: 'You are not an admin. Ask your admin for help. Or send a mail to support@gitgator.com', detail: ''});
          return;
        }
      } else {
        this.alertmsgs.push({severity: 'success', summary: 'Record Updated', detail: ''});
      }
    });
  }

  deleteUserRole(login: string) {
    this.gitService.deleteUserRole(login, this.currentOrg, 'Admin').subscribe(x => {
      if (x.code === 401) {
        this.alertmsgs.push({severity: 'error', summary: 'You are not an admin. Ask your admin for help. Or send a mail to support@gitgator.com', detail: ''});
      } else {
        this.alertmsgs.push({severity: 'success', summary: 'Record Updated', detail: ''});
      }
    });
  }
}
