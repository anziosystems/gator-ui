import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-lsauth-status',
  templateUrl: './lsauth-status.component.html',
  styleUrls: ['./lsauth-status.component.less']
})
export class LsauthStatusComponent implements OnInit {
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

   loginAndSetup() {
    //Get Org Details

    this.messages = [];
    this.errMessages = [];
    this.warningMessages = [];
    this.successMessages = [];
    this.progress = [];

    let statusbarWidth = 1;
    let t = setInterval(() => {
      let elem = document.getElementById('myBar');
      statusbarWidth = statusbarWidth + 1;
      if (statusbarWidth < 100) {
        elem.style.width = statusbarWidth + '%';
      } else {
        clearTimeout(t);
      }
    }, 200); //every 200 ms

    this.successMessages.push(`Yes!`);
  }

  ngOnInit(): void {
  }
  dashboard() {
    this.router.navigate(['/dashboard']).then(() => {
      //window.location.reload();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
