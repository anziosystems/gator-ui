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
    '#ff0040',
    '#ff00bf',
    '#bf00ff',
    '#ff99ff',
    '#4000ff',
    '#0040ff',
    '#00bfff',
    '#00ffbf',
    '#00ff40',
    '#bfff00',
    '#ffff00',
    '#ffbf00',
    '#ff8000',
    '#ff4000',
    '#ff0000',
    '#ff0040',
    '#ff00bf',
    '#bf00ff',
    '#ff99ff',
    '#4000ff',
    '#0040ff',
    '#00bfff',
    '#00ffbf',
    '#00ff40',
    '#bfff00',
    '#ffff00',
    '#ffbf00',
    '#ff8000',
    '#ff4000',
    '#ff0000',
  ];
  repos: Repo[] = [new Repo('Facility', '50', this.colors[0]), new Repo('Storage', '40', this.colors[1]), new Repo('Polus', '10', this.colors[2])];

  constructor(private gitService: GitService) {}
  _total: number;
  ngOnInit(): void {
    this.gitService.onDevLoginIdChanged.subscribe((val) => {
      let _currentOrg = this.gitService.getCurrentGitOrg();
      this.gitService.GetRepoParticipation4Login(_currentOrg, val.GitLogin, 30, false).subscribe(data => {
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
