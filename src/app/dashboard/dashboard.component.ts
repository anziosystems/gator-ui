import {Component, OnInit, Inject} from '@angular/core';
import {ChangeDetectorRef} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {ChangeDetectionStrategy, Input} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

export const STATE = () => ({
  items: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
  sectionItems: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
});
type PaneType = 'left' | 'right';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'], // changeDetection: ChangeDetectionStrategy.OnPush,
  // animations: [
  //   trigger('slide', [
  //     state('hide', style({ transform: 'translateX(-100%)' })),
  //     state('show', style({ transform: 'translateX(0)' })),
  //     transition('* => *', animate(300))
  // ])]
})
export class DashboardComponent implements OnInit {
  orgs: any;
  constructor(private router: Router, @Inject(LOCAL_STORAGE) private storage: WebStorageService) {
    setInterval(() => { 
     location.reload(); 
  }, 600000); //every 10 min
  }


  ngOnInit() {
    let token = this.storage.get('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
}
