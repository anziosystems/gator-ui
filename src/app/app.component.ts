import { Component, OnInit, Inject, NgModule } from '@angular/core';
//import {StatefulComponent} from '@labshare/ngx-stateful';
import { ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forwardRef, Optional, SkipSelf, ApplicationRef } from '@angular/core';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Subscription } from 'rxjs';

export const STATE = () => ({
  items: [{ name: 'Team' }, { name: 'Repositories' }, { name: 'Developers' }],
  sectionItems: [{ name: 'Team' }, { name: 'Repositories' }, { name: 'Developers' }],
  topNav: {
    iconColor: 'rgb(150, 150, 150)',
    background: 'rgb(36, 35, 35)',
  },
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
  @Input() activePane: PaneType = 'left';
  constructor(inj: ChangeDetectorRef, public appRef: ApplicationRef, private router: Router,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService) { }

  title = 'Gator';

  logout() {
    this.storage.remove('token');
    location.reload();
  }

  ngOnDestroy() { }

  ngOnInit() { }
  get inDashboard() {
    return this.router.url.startsWith('/dashboard');
  }

  // get isLoggedIn() {
  //   return this.storage.get('token');
  // }

  // changeSection(section) {
  //   this.menu = {...this.menu, selectedSection: section.id};
  // }

  // menu = {
  //   menuOpen: false,
  //   background: 'rgb(51, 51, 52)',
  //   leftBar: {
  //     ui: {
  //       width: 80,
  //       textColor: 'rgb(255, 255, 255)',
  //       tooltip: true,

  //       background: '#141414',
  //       mainTenantTextColor: '#fff',
  //       selectedItemBackground: 'rgb(36, 35, 35)',
  //       addTenantBackground: 'rgb(51, 51, 52)',
  //     },
  //   },
  //   ui: {
  //     font: 'Roboto',
  //     /* TODO: Reenable after hack */
  //     //arrowBorderColor: 'rgb(50, 50, 50)',
  //     arrowBackground: 'rgb(50, 50, 50)',
  //     arrowColor: 'rgb(255, 255, 255)',

  //     /* HACK, remove later */
  //     displayArrow: false,
  //     arrowBorderColor: 'rgb(36, 35, 35)',
  //   },
  //   leadBackground: 'rgb(36, 35, 35)',
  //   /* TODO: Revert to 1 */
  //   preserveMenu: 0,
  //   preserveSection: true,
  //   addMessage: 'Add Custom Team',
  //   selectedSection: null,
  //   profileIcon: false,
  // };
}
