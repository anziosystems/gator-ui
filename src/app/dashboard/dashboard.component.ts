import {Component, OnInit, Inject} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {ChangeDetectionStrategy, Input} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

/* Imports for Stateful Component */
import {ChangeDetectorRef, forwardRef, Optional, SkipSelf, ApplicationRef} from '@angular/core'; 
import {StatefulComponent, StatefulParent, StatefulService} from '@labshare/ngx-stateful';
/* Import defaults for LeftNavComponent State */

export const STATE = () => {
  /* Get defaults for leftNav's leftBar */

  return {
    items: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
    sectionItems: [{name: 'Team'}, {name: 'Repositories'}, {name: 'Developers'}],
    currentOrg: null,
    topNav: {
      iconColor: 'rgb(150, 150, 150)',
      background: 'rgb(36, 35, 35)'
    }
  }
};
export const PROPS = {} 

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

  /* For Stateful Component */
  providers: [
    {
            provide: StatefulParent,
            useExisting: forwardRef(() => DashboardComponent)
    }
  ] 
})
export class DashboardComponent extends StatefulComponent implements OnInit {
  orgs: any;

  menu = {
    menuOpen: false,
    background: 'rgb(51, 51, 52)',
    leftBar: {
      ui: {
        width: 80,
        textColor: 'rgb(255, 255, 255)',
        tooltip: true,
        
        background: '#141414',
        mainTenantTextColor: '#fff',
        selectedItemBackground: 'rgb(36, 35, 35)',
        addTenantBackground: 'rgb(51, 51, 52)'
      }
    },
    ui: {
      font: 'Roboto',
      /* TODO: Reenable after hack */
      //arrowBorderColor: 'rgb(50, 50, 50)',
      arrowBackground: 'rgb(50, 50, 50)',
      arrowColor: 'rgb(255, 255, 255)',

      /* HACK, remove later */
      displayArrow: false,
      arrowBorderColor: 'rgb(36, 35, 35)',
    },
    leadBackground: 'rgb(36, 35, 35)',
    /* TODO: Revert to 1 */
    preserveMenu: 0,
    preserveSection: true,
    addMessage: 'Add Custom Team',
    selectedSection: null,
    profileIcon: false
  }

  constructor(
    private router: Router, 
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,

    /* For Stateful Components */
    inj: ChangeDetectorRef,
    @Optional() @SkipSelf() public statefulParent: StatefulParent,
    public statefulService: StatefulService,
    public appRef: ApplicationRef

  ) {
    /* Call StatefulComponent */
    super(inj, STATE, statefulParent, statefulService, appRef);

    setInterval(() => {
      location.reload();
    }, 600000); //every 10 min
  }

  onStatefulInit() {
    let token = this.storage.get('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.storage.remove('token');
    location.reload();
  }

  changeSection(section) {
    this.menu = {...this.menu, selectedSection: section.id}
  }

  /* TODO: Remove once diff feature implemented in NgxStateful */
  prevState = STATE();
  currState = STATE();

  onStatefulChanges() {
    this.currState = this.state.read();
    this.prevState = this.currState;
  }
}
