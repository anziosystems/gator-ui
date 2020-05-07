import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // let tenantName = this.route.snapshot.paramMap.get('tenant');
    // if (!tenantName) {
    //   this.router.navigate(['/tenantq']);
    // }
  }
}
