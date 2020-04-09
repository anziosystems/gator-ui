import {Component, OnInit} from '@angular/core';
import {GitService, CustomEvent, DevDetails} from '../git-service';

class Repo {
  Name: string;
  Size: string;
  Color: string;

  constructor(name: string, size: string, color: string) {
    this.Name = name;
    this.Size = size + '%';
    this.Color = color;
  }
}

@Component({
  selector: 'app-linebar',
  templateUrl: './linebar.component.html',
  styleUrls: ['./linebar.component.less'],
})
export class LinebarComponent implements OnInit {
  colors: string[] = [
    '#ffe6ff',
    '#ffccff',
    ' #ffb3ff',
    '#ff99ff',
    '#ff80ff',
    '#ff66ff',
    '#ff33ff',
    '#ff00ff',
    '#e600e6',
    '#cc00cc',
    '#b300b3',
    '#990099',
    '#800080',
    '#660066',
    '#4d004d',
    '#330033',
    '#1a001a',
    '#000000',
  ];
  repos: Repo[] = [new Repo('Facility', '50', this.colors[0]), new Repo('Storage', '40', this.colors[1]), new Repo('Polus', '10', this.colors[2])];

  constructor(private gitService: GitService) {}
  _total: number;
  ngOnInit(): void {
    this.gitService.onDevLoginIdChanged.subscribe((val: string) => {
      let _currentOrg = this.gitService.getCurrentOrg();
      this.gitService.GetRepoParticipation4Login(_currentOrg, val, 30, false).subscribe(data => {
        /*data[0]
          {Repo: "ngx-facility", ctr: 33}
        */

        this.repos = [];
        this._total = 0;
        data.forEach(x => {
          this._total = this._total + x.ctr;
        });

        data.forEach((x, i) => {
          let idx: number = 0;
          if (i < this.colors.length - 1) {
            idx = i;
          } else {
            idx = this.colors.length - (i - this.colors.length);
          }
          if (idx < 0) idx = 0;
          let r = new Repo(x.Repo, Math.round((x.ctr * 100) / this._total).toString(), this.colors[idx]);
          this.repos.push(r);
        });

        console.log(data);
      });
    });
  }
}
