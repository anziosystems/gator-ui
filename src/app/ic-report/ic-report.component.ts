import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {WeekDay} from '@angular/common';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-ic-report',
  templateUrl: './ic-report.component.html',
  styleUrls: ['./ic-report.component.less'],
})
export class IcReportComponent implements OnInit {
  closeCtr: number[] = [];
  openCtr: number[] = [];
  allDates: number[] = [];

  chart = [];
  constructor(private gitService: GitService) {}

  ngOnInit() {
    this.gitService.onMyEvent.subscribe((val: string) => {
      if (val.lastIndexOf('+') > 0) {
        return;
      }

      if (val.startsWith('repo-')) {
        return;
      }

      this.getGraphData(val);
      this.getReports(val);
    });
  }

  textStatus: string;
  getReports(login: string) {
    this.textStatus = '';
    this.gitService.getSR4User(login, false).subscribe(val => {
      val.map(item => {
        this.gitService.getSR4Id(item.SRId, false).subscribe(val => {
          if (!val) {
            console.log('getSR4Id did not get any data.');
            return;
          }
          this.textStatus = 'Only for Admins'; //this.textStatus + val[0].StatusDetails;
        });
      });
    });
  }

  reportsId: [number] = [0];

  getGraphData(login: string) {
    this.closeCtr = [];
    this.openCtr = [];
    this.allDates = [];
    this.gitService.getGraphData4XDays(this.gitService.getCurrentOrg(), login, 90).subscribe(results => {
      results.map(res => {
        if (res.State === 'closed') {
          this.closeCtr.push(res.Ctr);
        }
        if (res.State === 'open') {
          this.openCtr.push(res.Ctr);
        }
      });

      //this.allDates = res.map ( res => res.Date );

      for (let i = 1; i < this.closeCtr.length; i++) {
        this.allDates.push(i);
      }

      this.chart = new Chart('canvas', {
        type: 'line',
        data: {
          labels: this.allDates,
          datasets: [
            {
              data: this.closeCtr,
              borderColor: '#98FB98',
              fill: false,
              label: 'close',
            },
            {
              data: this.openCtr,
              borderColor: '#ff00ff',
              fill: false,
              label: 'open',
            },
          ],
        },
        options: {
          maintainAspectRatio: true,

          legned: {
            display: true,
          },
          scales: {
            xAxes: [
              {
                display: true,
              },
            ],
            yAxes: [
              {
                display: true,
              },
            ],
          },
        },
      });

      this.chart = new Chart('canvas2', {
        type: 'bar',
        data: {
          labels: this.allDates,

          datasets: [
            {
              data: this.closeCtr,
              borderColor: '#98FB98',
              fill: true,
              label: 'Report Ratings',
              backgroundColor: '#98FB98',
            },
          ],
        },
        options: {
          maintainAspectRatio: true,
          legned: {
            display: true,
          },
          scales: {
            xAxes: [
              {
                display: true,
              },
            ],
            yAxes: [
              {
                display: true,
              },
            ],
          },
        },
      });
    });
  }
}
