import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tfs-status',
  templateUrl: './tfs-status.component.html',
  styleUrls: ['./tfs-status.component.less'],
})
export class TfsStatusComponent implements OnInit {
  hookStatus: boolean = false;
  orgStatus: boolean = false;
  repoStatus: boolean = false;
  prStatus: boolean = false;
  repoCount: number = 0;
  orgList: any;
  messages: string[];
  successMessages: string[];
  errMessages: string[];
  warningMessages: string[];
  progress: string[];
  buttonDisabled: boolean = true;
  hookFail: boolean = true;
  ctr = 0;

  constructor(private gitService: GitService, private router: Router) {
    this.loginAndSetup();
  }

  ngOnInit(): void {}

  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      //window.location.reload();
    });
  }

  loginAndSetup() {
    //Get Org Details

    this.messages = [];
    this.errMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.progress = [];
    this.messages.push('done ...');
  }
}
