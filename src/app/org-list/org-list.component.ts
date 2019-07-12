import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GitService} from '../git-service';
import { Route } from '@angular/compiler/src/core';

/* For Stateful Component */
import {ChangeDetectorRef, forwardRef, Optional, SkipSelf, ApplicationRef} from '@angular/core'; 
import {StatefulComponent, StatefulParent, StatefulService} from '@labshare/ngx-stateful';

export const STATE = () => ({
})
export const PROPS = {} 

@Component({
  selector: 'app-org-list',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.less'],
  providers: [
    {
      provide: StatefulParent,
      useExisting: forwardRef(() => OrgListComponent)
    }
  ]  
})
export class OrgListComponent extends StatefulComponent implements OnInit {
  back_colors: string[];
  colors: string[];

  @Output() changeOrgList = new EventEmitter();

  constructor(
    private gitService: GitService, 
    private route: ActivatedRoute, 
    private router: Router,
    /* For Stateful */
    inj: ChangeDetectorRef,
    @Optional() @SkipSelf() public statefulParent: StatefulParent,
    public statefulService: StatefulService,
    public appRef: ApplicationRef    
  ) {
    super(inj, STATE, statefulParent, statefulService, appRef);    
    this.back_colors = [];
    this.back_colors.push('#01A9DB');
    this.back_colors.push('#74DF00');
    this.back_colors.push('#DBA901');
    this.back_colors.push('#FF4000');
    this.back_colors.push('#0404B4');
    this.back_colors.push('#01A9DB');
    this.back_colors.push('#74DF00');
    this.back_colors.push('#DBA901');
    this.back_colors.push('#FF4000');
    this.back_colors.push('#0404B4');
    this.colors = [];
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
    this.colors.push('white');
  }

  data(org: any) {
    this.gitService.currentOrg = org;
    this.router.onSameUrlNavigation = 'reload';
    this.router.initialNavigation();
    this.router.navigate(['/dashboard'], {
      queryParams: {Org: org, refresh: new Date().getTime()},
    });
  }

  onStatefulInit() {
    this.gitService.currentOrg  = this.route.snapshot.queryParamMap.get("Org")
    this.gitService.getOrgList().subscribe(result => {

      /* Map to LeftNav sectionItems property */
      let sectionItems = result.map(r => ({
        name: r.Org.toUpperCase().slice(0, 4),
        id: r.Org,
        icon: null
      }))
      this.orgList = sectionItems;
      this.changeOrgList.emit(sectionItems);
    });
  }

  /* TODO: Remove once diff feature implemented in NgxStateful */
  prevState = STATE();
  currState = STATE();

  orgList = []
  
  _currentOrg = null;
  get currentOrg() {
    return this._currentOrg;
  }
  @Input() set currentOrg(value) {
    this._currentOrg = value;
    this.data(value);
  }

  onStatefulChanges() {
    this.currState = this.state.read();
    this.prevState = this.currState;
  }
}
