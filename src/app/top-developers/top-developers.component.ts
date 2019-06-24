import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService} from '../git-service';
import {Observable, of} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {debug} from 'util';
import * as _ from 'lodash';
import { UsageService } from '@labshare/ngx-core-services';
import {animate, state, style, transition, trigger, stagger, query, keyframes} from '@angular/animations';

@Component({
  selector: 'app-top-developers',
  templateUrl: './top-developers.component.html',
  styleUrls: ['./top-developers.component.less'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
         query (':enter', style ({ opacity:0}), {optional: true}),
         query (':enter', stagger ('300ms', [
           animate ('1s easae-in', keyframes ([
             style ({opacity:0, transform:'translateY(-75px)', offset:0}),
             style ({opacity:.5, transform:'translateY(35px)', offset:0.3}),
             style ({opacity:1, transform:'translateY(0)', offset:1}),
           ]))
         ]),{optional: true})
      ])
  ])]
}) 

export class TopDevelopersComponent implements OnInit {
  developers: any[] ;
  avatar: any[];
  devDetails: any[];
  navigationSubscription: any;

  @Output()
  messageEvent = new EventEmitter<string>();

  constructor(private gitService: GitService, private router: Router, private usageService: UsageService) {
    this.developers = [];
    this.avatar = [];
   
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeData();
      }
    });
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  data(developer: string) {
    const date = new Date();

    this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
 
    this.gitService.trigger(developer);
  }

  initializeData() {
  
    this.developers = [];
    this.avatar = [];
    this.gitService.ready().then(result => {
      this.gitService.getTopDevelopers(this.gitService.currentOrg, 15).subscribe(val => {
        const devs = val.map(item => item.login + '--' + item.Avatar_Url).filter((value, index, self) => self.indexOf(value) === index);
        devs.map(item => {
          const arr = _.split(item, '--');
          this.avatar.push(arr[1]);
          console.log(this.avatar);
          this.developers.push(arr[0]);
        });
      });
    });
  }

  ngOnInit() {}
}
