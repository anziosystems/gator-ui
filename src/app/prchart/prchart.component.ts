import {Component, OnInit} from '@angular/core';
import {GitService} from '../git-service';
import {WeekDay} from '@angular/common';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-prchart',
  templateUrl: './prchart.component.html',
  styleUrls: ['./prchart.component.less'],
})
export class PrchartComponent implements OnInit {
  closeCtr: number[] = [];
  openCtr: number[] = [];
  allDates: number[] = [];

  chart = [];
  constructor(private gitService: GitService) {}

  ngOnInit() {
    let day = 30;
    //currentOrg does not work with an standalone page. hardcode to see graph as an standalone page. 
    //replace this.gitService.currentOrg with LabShare
    this.gitService.getGraphData4XDays(this.gitService.currentOrg, day).subscribe(results => {
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
              label:'close',
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
