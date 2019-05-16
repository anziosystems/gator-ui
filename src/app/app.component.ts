import {Component, OnInit} from '@angular/core';
//import {StatefulComponent} from '@labshare/ngx-stateful';
import {ChangeDetectorRef} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ChangeDetectionStrategy, Input} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; 

export const STATE = () => ({
  items: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
  sectionItems: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
});
type PaneType = 'left' | 'right';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  // animations: [
  //   trigger('slide', [
  //     state('hide', style({ transform: 'translateX(-100%)' })),
  //     state('show', style({ transform: 'translateX(0)' })),
  //     transition('* => *', animate(300))
  // ])]
})
export class AppComponent implements OnInit {
  // extends StatefulComponent {

  ngOnInit() {}

  @Input() activePane: PaneType = 'left';
  constructor(cdr: ChangeDetectorRef, private router: Router, private cookieService: CookieService) {
    //  super(cdr, STATE);
  }

  title = 'Gator';
}
