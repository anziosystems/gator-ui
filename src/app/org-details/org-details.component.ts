import {Component, OnInit, EventEmitter, Inject, Output, Injectable, ViewChild} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {GitService, DevDetails} from '../git-service';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';

import {TreeNode} from 'primeng/api';
import {ChildActivationEnd} from '@angular/router';

@Component({
  selector: 'app-org-details',
  templateUrl: './org-details.component.html',
  styleUrls: ['./org-details.component.less'],
})
export class OrgDetailsComponent implements OnInit {
  data: TreeNode[];
  selectedPerson: TreeNode;
  isShowDetail: boolean = false;
  isJiraShowDetail: boolean = false;
  constructor(private gitService: GitService, @Inject(LOCAL_STORAGE) private storage: WebStorageService, private router: Router) {}

  ngOnInit() {
    let token = this.storage.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.gitService.triggerIsLoggedIn(true);

    // //Jira
    // let jiratoken = this.storage.get('JiraToken');
    // if (!jiratoken) {
    //   this.router.navigate(['/jira-login']);
    // }

    this.gitService.onGlobalComponentMessage.subscribe((val: string) => {
      if (val === 'CLOSE_PULL_DETAILS') {
        this.isShowDetail = false;
      }
      if (val === 'SHOW_PULL_DETAILS') {
        this.isShowDetail = true;
        this.isJiraShowDetail = false;
      }

      if (val === 'CLOSE_JIRA_DETAILS') {
        this.isJiraShowDetail = false;
      }
      if (val === 'SHOW_JIRA_DETAILS') {
        this.isJiraShowDetail = true;
        this.isShowDetail = false;
      }
    });
    this.process();
  }

  nodeSelect(obj) {
    // alert(obj.node.label + ' ' + obj.node.data);
    let d = new DevDetails();
    d.login = obj.node.data;
    d.name = obj.node.label;
    this.GetData(d);
  }

  gitData(developer: DevDetails) {
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //this trigger kicks dev-pull-details components as it is subscribed to
    //this trigger, which in turn goes and fill the devloper details for git
    this.gitService.setCurrentDev(developer);
    this.gitService.trigger(developer.login);
    this.gitService.broadcastGlobalComponentMessage('SHOW_PULL_DETAILS');
    this.isShowDetail = true;
    //This to add developer in the status report component
    // if (!this.bCallingFromInit) {
    //   this.gitService.triggerCustomEvent({
    //     source: 'TOP-DEVELOPER',
    //     destination: 'STATUS-REPORT',
    //     message: developer.login,
    //   });
    //}
  }

  jiraData(developer: DevDetails) {
    this.gitService.setCurrentDev(developer);
    const date = new Date();

    // this.usageService.send ({event: 'Dev Details', info: 'Dev: ' + developer,  LogTime: date.toUTCString()});
    //
    if (!this.storage.get('JiraToken')) {
      this.router.navigate(['/jira-login']);
      return;
    }
    // else {
    //   //Delete this else clause
    //   this.router.navigate(['/jiraStatus']);

    // }
    this.gitService.triggerJira(developer.name);
    this.gitService.broadcastGlobalComponentMessage('SHOW_JIRA_DETAILS');
  }

  selectedDev: string;
  GetData(dev: DevDetails) {
    if (this.gitService.getCurrentContext() === 'undefined') this.gitService.setCurrentContext('GIT');
    this.selectedDev = dev.login;
    if (this.gitService.getCurrentContext() === 'JIRA') {
      this.jiraData(dev);
    } else {
      this.gitData(dev);
    }
  }

  process() {
    /*
    { key: 1, name: "Eng Management" }
    { key: 2, name: "Rafat Sarosh", userid: 'rsarosh' , parent: 1 }
  */
    class Node {
      parent: any;
      child: any[];
      constructor() {
        this.child = new Array<any>();
      }
    }

    class TNode {
      label: string;
      data: string;
      expandedIcon: string;
      collapsedIcon: string;
      children: TNode[];
      constructor() {
        this.children = new Array<TNode>();
      }
    }

    function getElementfromNodeDataArray(key: number) {
      for (let o of _obj.nodeDataArray) {
        if (o.key === key) return o;
      }
      return null;
    }

    let _nodes: Map<number, Node> = new Map<number, Node>();
    let _obj;
    this.gitService.getOrgChart(this.gitService.getCurrentOrg(), true).subscribe(v => {
      if (!v[0]) {
        alert('Create the Org chart firrst');
        this.router.navigate(['/orgChart']);
      }
      _obj = JSON.parse(v[0].OrgChart);
      _obj.nodeDataArray.forEach(x => {
        if (x.key === 1) {
          let _n = new Node();
          _n.parent = x;
          _nodes.set(x.key, _n);
          return;
        }

        if (x.parent) {
          let n = _nodes.get(x.parent);
          if (!n) {
            //parent not found, make a new node
            let _n = new Node();
            _n.parent = getElementfromNodeDataArray(x.parent);
            _n.child.push(x);
            _nodes.set(x.parent, _n);
          } else {
            //parent found, let set the child
            n.child.push(x);
          }
        }
      });
      let Data: TNode[] = [];
      _nodes.forEach(x => {
        let data = new TNode();
        data.label = x.parent.name;
        data.data = x.parent.userid;
        data.expandedIcon = 'pi pi-folder-open';
        data.collapsedIcon = 'pi pi-folder';
        for (let y of x.child) {
          let c = new TNode();
          c.label = y.name;
          c.data = y.userid;
          c.expandedIcon = 'pi pi-folder-open';
          c.collapsedIcon = 'pi pi-folder';
          data.children.push(c);
        }
        Data.push(data);
      });

      for (let z of Data) {
        if (z.children) {
          let cCtr = 0;
          for (let c of z.children) {
            let n = IsChildrenExistAsNode(c.label);
            if (n) {
              z.children[cCtr] = n;
            }
            cCtr = cCtr + 1;
          }
        }
      }
      this.data = Data;

      function IsChildrenExistAsNode(lbl: string): TNode {
        for (let n of Data) {
          if (n.label === lbl) {
            Data = Data.filter(obj => obj !== n);
            return n;
          }
        }
      }
    });
  }
}
