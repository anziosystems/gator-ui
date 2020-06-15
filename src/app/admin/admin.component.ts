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
import {DialogService} from 'primeng/dynamicdialog';

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

    this.loggedInUser = this.gitService.getLoggedInDev().GitLogin;
    if (!this.loggedInUser) {
      this.router.navigate(['/lsauth']);
      return;
    }
  }

  moveAdmin2User(u: any) {
    this.userRoles = this.userRoles.filter(function(value, index, arr) {
      return value !== u;
    });
    this.allUsers.push(u);
    if (u.login) this.deleteUserRole(u.login);
    else this.deleteUserRole(u.Email);
  }

  moveUser2Admin(u: any) {
    //remove from allUsers
    this.allUsers = this.allUsers.filter(function(value, index, arr) {
      return value !== u;
    });
    //Add to admin list
    this.userRoles.push(u);
    this.save(u.Email);
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
      this.gitService.getRole4Org(this.currentOrg).subscribe(r => {
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
  save(login: string) {
    this.gitService.saveUserRole(login, this.currentOrg, 'Admin').subscribe(x => {
      if (x) {
        if (x.code === 401) {
          this.alertmsgs.push({severity: 'error', summary: 'You are not an admin. Ask your admin for help. Or send a mail to support@Dev-Star.com', detail: ''});
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
        this.alertmsgs.push({severity: 'error', summary: 'You are not an admin. Ask your admin for help. Or send a mail to support@Dev-Star.com', detail: ''});
      } else {
        this.alertmsgs.push({severity: 'success', summary: 'Record Updated', detail: ''});
      }
    });
  }
}
