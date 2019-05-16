import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {Router} from '@angular/router';
import {GitService} from '../git-service';

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.less'],
})
export class OrgListComponent implements OnInit {
  orgList: any[];
  back_colors: string[];
  colors: string[];

  constructor(private gitService: GitService, private router: Router) {
    this.back_colors = [];
    this.back_colors.push('blue');
    this.back_colors.push('magenta');
    this.back_colors.push('green');
    this.back_colors.push('Yellow');
    this.back_colors.push('red');

    this.colors = [];
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('black');
    this.colors.push('white');
  }

  data(org: any) {
    this.gitService.currentOrg = org.Org;
    this.router.onSameUrlNavigation = 'reload';
    this.router.initialNavigation();
    this.router.navigate(['/dashboard'], {
      queryParams: {refresh: new Date().getTime()},
    });
    console.log('from orgList' + this.gitService.currentOrg);
  }

  ngOnInit() {
    this.gitService.GetOrgList().subscribe(result => {
      this.orgList = result;
    });
  }
}
