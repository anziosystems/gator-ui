import {Injectable, Input, Inject, Optional, SkipSelf} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subject, interval} from 'rxjs';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'ngx-webstorage-service';
import {Router} from '@angular/router';
import {promise} from 'protractor';
import {resolve} from 'path';
import {reject} from 'q';
import {typeWithParameters} from '@angular/compiler/src/render3/util';
import {timingSafeEqual} from 'crypto';
import * as _ from 'lodash';
import {FindValueOperator} from 'rxjs/internal/operators/find';

/*
Jira calls must have following in the header

req.headers['jiraOrg'];  //AccessibleResources Id
req.headers['jiraAuthorization'];  //This is JiraTenant Id

*/
export class Node {
  parent: any;
  child: any[];
  constructor() {
    this.child = new Array<any>();
  }
}

export class TNode {
  label: string;
  data: string;
  expandedIcon: string;
  collapsedIcon: string;
  children: TNode[];
  constructor() {
    this.children = new Array<TNode>();
  }
}
export class DevDetails {
  public name: string;
  public UserName: string;
  public DisplayName: string;
  public Login: string;
  public OrgDisplayName: string;
  public JiraUserName: string;
  public TfsUserName: string;
  public image: string;
  public GitLogin: string;
  public id: number;
  public profileUrl: string;
  public avatarUrl: string;
  public email: string;
  public tenantId: number;
  public bWatch: boolean;
  public bKudos: boolean;
}

export class CustomEvent {
  public source: string;
  public destination: string;
  public message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GitService {
  public tenantMap = new Map();

  private currentGitOrg: string;
  private currentOrg: string;
  private jiraCurrentOrg: string;
  private token: string;
  private jiraToken: string;
  private tenant: string; //token and tenant is same today
  private jiraTenant: string;
  private loggedInGitDev: DevDetails;
  private currentDev: DevDetails;
  private currentContext: string; //JIRA/GIT
  private gitUsersMapOrgEmail = new Map<string, DevDetails>();
  private gitUsersMapGitId = new Map<string, DevDetails>();
  public httpOptions: any;
  public httpJirapOptions: any;
  public query: string;
  public JIRA_ORG_LIST: string = 'JIRA-ORG-LIST';
  private NO_DAYS: number = 25;
  /*
    jiraOrgList: Array(3)
    0:
    avatarUrl: "https://site-admin-avatar-cdn.prod.public.atl-paas.net/avatars/240/koala.png"
    id: "0e493c98-6102-463a-bc17-4980be22651b"
    name: "labshare"
    scopes: (4) ["manage:jira-configuration", "write:jira-work", "read:jira-work", "read:jira-user"]
    url: "https://labshare.atlassian.net"
  */
  jiraOrgList: any; //jiraOrgList [0].name , jiraOrgList [0].id  etc

  /*
 JiraUsersList: Array(3)
 0: (20)
 1: (234)
 2: (456)
 JiraUsersList: Array(3)
   0: Array(29)
   0:
   accountId: "5d53f3cbc6b9320d9ea5bdc2"  //
   accountType: "app"
   active: true
   avatarUrls: {48x48: "https://secure.gravatar.com/avatar/40cff14f727dbf6…c.atl-paas.net%2Finitials%2FJO-4.png&size=48&s=48", 24x24: "https://secure.gravatar.com/avatar/40cff14f727dbf6…c.atl-paas.net%2Finitials%2FJO-4.png&size=24&s=24", 16x16: "https://secure.gravatar.com/avatar/40cff14f727dbf6…c.atl-paas.net%2Finitials%2FJO-4.png&size=16&s=16", 32x32: "https://secure.gravatar.com/avatar/40cff14f727dbf6…c.atl-paas.net%2Finitials%2FJO-4.png&size=32&s=32"}
   displayName: "Jira Outlook"
   self: "https://api.atlassian.com/ex/jira/786d2410-0054-411f-90ed-392c8cc1aad1/rest/api/3/user?accountId=5d53f3cbc6b9320d9ea5bdc2"

 */

  public JiraUsersList: any;
  //Keeps the map od Jira display Name and accountId
  JiraUsersMap = new Map();

  public gatorApiUrl = 'https://gator-api-ppe.azurewebsites.net'; //'https://gator-api.azurewebsites.net'; // process.env.SERVICE_URL; // 'https://gator-api.azurewebsites.net';
  //public gatorApiUrl = 'https://localhost:3000'; // process.env.SERVICE_URL; // 'https://gator-api.azurewebsites.net';

  public gitApiUrl: string = this.gatorApiUrl + '/service/';

  //Components listen to each other using this
  private _onCustomEvent = new Subject<CustomEvent>();
  private _onStringEvent = new Subject<string>();
  private _onDevNameEvent = new Subject<DevDetails>();
  private _onJiraEvent = new Subject<DevDetails>();
  private _onComponentMessage = new Subject<string>();
  private _isLoggedIn = new Subject<boolean>();
  private _onGitOrg = new Subject<string>();

  constructor(
    private http: HttpClient,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    private router: Router,
    @Optional() @SkipSelf() parentmodule: GitService,
  ) {
    if (parentmodule) {
      throw new Error('GitService is already loaded. Import it in ONLY AppModule');
    }
    this.loggedInGitDev = new DevDetails();
    this.currentDev = new DevDetails();

    //Lets refresh values out of session storage
    this.getLoggedInDev();
    this.getCurrentGitOrg();
    this.getCurrentOrg();
    this.getCurrentDev();

    //keep all lowercase
    this.tenantMap.set('anzio', 'anzio');
    this.tenantMap.set('axleinfo', 'axleinfo');
    this.tenantMap.set('labshare', 'labshare');

    console.log(' ****** gitService Constructor is running =>' + new Date());
  }

  getCurrentContext(): string {
    if (!this.currentContext) {
      this.currentContext = this.sessionStorage.get('CURRENT-CONTEXT');
    }
    return this.currentContext;
  }

  setCurrentContext(ctx: string) {
    if (ctx) {
      this.currentContext = ctx;
      this.sessionStorage.set('CURRENT-CONTEXT', ctx);
    }
  }

  setCurrentDev(dev: DevDetails) {
    if (dev) {
      if (dev.Login) {
        this.currentDev = dev;
        this.sessionStorage.set('CURRENT-DEV', dev);
      }
    }
  }

  //This current dev is about which dev is clicked on TopDev and other places. If you want to know the current logged in user then call
  //getLoggedInUSerDetails

  getCurrentDev(): DevDetails {
    if (!this.currentDev) {
      this.currentDev = this.sessionStorage.get('CURRENT-DEV');
    }
    if (!this.currentDev.GitLogin) {
      this.currentDev = this.sessionStorage.get('CURRENT-DEV');
    }
    return this.currentDev;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public setJiraToken(token: string) {
    this.jiraToken = token;
  }

  public setLoggedInDev(v: DevDetails) {
    if (v) {
      // if (v.GitLogin) {
      this.loggedInGitDev = new DevDetails();
      this.loggedInGitDev.name = v.name;
      this.loggedInGitDev.image = v.image;
      this.loggedInGitDev.GitLogin = v.GitLogin;
      this.loggedInGitDev.OrgDisplayName = v.OrgDisplayName;
      this.loggedInGitDev.id = v.id;
      this.loggedInGitDev.profileUrl = v.profileUrl;
      this.loggedInGitDev.Login = v.Login;
      this.loggedInGitDev.JiraUserName = v.JiraUserName;
      this.loggedInGitDev.TfsUserName = v.TfsUserName;
      this.loggedInGitDev.UserName = v.UserName;
      this.loggedInGitDev.DisplayName = v.DisplayName;
      this.sessionStorage.set('LOGGEDIN_USER', v);
      // }
    }
  }

  // public setLoggedInGitDev(v: DevDetails) {
  //   if (v) {
  //     // if (v.GitLogin) {
  //     this.loggedInGitDev = new DevDetails();
  //     this.loggedInGitDev.name = v.name;
  //     this.loggedInGitDev.image = v.image;
  //     this.loggedInGitDev.GitLogin = v.GitLogin;
  //     this.loggedInGitDev.OrgDisplayName = v.OrgDisplayName;
  //     this.loggedInGitDev.id = v.id;
  //     this.loggedInGitDev.profileUrl = v.profileUrl;
  //     this.loggedInGitDev.Login = v.Login;
  //     this.loggedInGitDev.JiraUserName = v.JiraUserName;
  //     this.loggedInGitDev.TfsUserName = v.TfsUserName;
  //     this.loggedInGitDev.UserName = v.UserName;
  //     this.loggedInGitDev.DisplayName = v.DisplayName;
  //     this.sessionStorage.set('LOGGEDIN_GIT_USER', v);
  //     // }
  //   }
  // }

  //Gets Current loggedIn User
  /*
      DisplayName: "Rafat Sarosh"
      GitUserName: null
      JiraUserName: null
      TfsUserName: null
      UserName: "rafat.sarosh@axleinfo.com"
      id: 8584
      image: ""
      login: "rafat.sarosh@axleinfo.com"
      name: "Rafat Sarosh"

  */
  public getLoggedInDev(): DevDetails {
    if (!this.loggedInGitDev.hasOwnProperty('name')) {
      //it is an empty object
      let data = this.sessionStorage.get('LOGGEDIN_USER');
      if (!data) {
        console.log('getLoggedInGitDev ==> no entry for GCU. exiting. Let the user re-login');
        return null; //TODO: Force a re-login
      }
      // let buff = atob(data);
      this.loggedInGitDev = data;
    }
    return this.loggedInGitDev;
  }

  async fillUserMap4CurrentOrg(): Promise<boolean> {
    return new Promise((done, fail) => {
      let co = this.sessionStorage.get('CURRENT-ORG');
      this.getUser4Org(co).subscribe(result => {
        if (result.code === 401) {
          fail('401');
          return;
        }
        if (this.gitUsersMapOrgEmail.size === 0) {
          result.forEach(r2 => {
            let dd = new DevDetails();
            dd.name = r2.UserDisplayName;
            dd.UserName = r2.UserName;
            dd.DisplayName = r2.UserDisplayName;
            dd.Login = r2.Email;
            dd.image = r2.Photo;
            dd.id = r2.Id;
            dd.profileUrl = r2.profileUrl;
            dd.GitLogin = r2.GitUserName;
            dd.JiraUserName = r2.JiraUserName;
            dd.TfsUserName = r2.TfsUserName;
            // dd.tenantId = e2.TenantId;
            this.gitUsersMapOrgEmail.set(r2.Email.trim(), dd);
            this.gitUsersMapGitId.set(r2.UserName, dd);
          });
        }
        done(true);
        return;
      });
    });
  }

  getDevDetails4GitId(login: string): Promise<DevDetails> {
    return new Promise((done, fail) => {
      try {
        if (this.gitUsersMapGitId.size === 0) {
          this.fillUserMap4CurrentOrg().then(x => {
            let v = this.gitUsersMapGitId.get(login);
            done(v);
          });
        } else {
          done(this.gitUsersMapGitId.get(login));
        }
      } catch (ex) {
        fail(ex);
      }
    });
  }

  getDevDetails4Login(login: string): Promise<DevDetails> {
    return new Promise((done, fail) => {
      try {
        if (this.gitUsersMapOrgEmail.size === 0) {
          this.fillUserMap4CurrentOrg().then(x => {
            let y = this.gitUsersMapOrgEmail.get(login);
            done(y);
          });
        } else {
          let x = this.gitUsersMapOrgEmail.get(login);
          done(x);
        }
      } catch (ex) {
        fail(ex);
      }
    });
  }

  //return the event as observable so others can subscribe to it
  public get onIsLoggedInEvent(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  public get onStringEvent(): Observable<string> {
    return this._onStringEvent.asObservable();
  }

  public get onDevLoginIdChanged(): Observable<DevDetails> {
    return this._onDevNameEvent.asObservable();
  }

  public get onCustomEvent(): Observable<CustomEvent> {
    return this._onCustomEvent.asObservable();
  }

  public get onJiraEvent(): Observable<DevDetails> {
    return this._onJiraEvent.asObservable();
  }

  public get onGlobalComponentMessage(): Observable<string> {
    return this._onComponentMessage.asObservable();
  }

  /* 
   Component calls this trigger
   pullRequestCount it with "Action -day" and Top-developer calls it with developer name
   DevPullDetailsComponent is subscribing it
   this.gitService.onMyEvent.subscribe((val: string) => {
  */

  public triggerIsLoggedIn(value: boolean) {
    this._isLoggedIn.next(value);
  }

  /*
    This trigger is overloaded some time it gets a value like this
                   => action + '+' + day.toString()
    sometime just  => developer.login 
    someitime      => 'repo-' + repo
  */
  //Note: Move some events to broadcastDevLoginId
  public broadcastStringValue(value: string) {
    this._onStringEvent.next(value);
  }

  public get onGitOrgChanged(): Observable<string> {
    return this._onGitOrg.asObservable();
  }

  public broadecastGitOrgChanged(value: string) {
    if (!value) {
      console.log(`[E] Was about to broadcast an undefined GitOrg - broadcastGitOrgChanged`);
      return;
    }
    this._onGitOrg.next(value);
  }

  public broadcastDevLoginId(value: DevDetails) {
    this._onDevNameEvent.next(value);
  }

  public broadcastCustomEvent(value: CustomEvent) {
    this._onCustomEvent.next(value);
  }

  public broadcastJiraDevName(value: DevDetails) {
    this._onJiraEvent.next(value);
  }

  public broadcastGlobalComponentMessage(value: string) {
    this._onComponentMessage.next(value);
  }

  getHookStatus(org: string): any {
    this.attachToken();
    const q = `GetHookStatus?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  setupWebHook(org: string): any {
    this.attachToken();
    const q = `SetupWebHook?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getGraphData4XDays(org: string, login: string = null, day: number, bustTheCache: boolean = false): any {
    this.attachToken();
    // let org = this.currentOrg ;
    const q = `GetGraphData4XDays?org=${org}&login=${login}&day=${day}&bustTheCache=${bustTheCache}`;

    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*
  This is not called very often, only called from status - So it is ok to go to git

  Get Repos from Git and Saves in SQL
  */

  getRepoList(org: string, getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachGitToken();
    const q = `GetRepos?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*
  This is not called very often, only called from status - only status goes to git
  for the org, gets the repo and then get all the PR. This is better way to fill all the PR, calling every Repo overwhelm the network

  */
  getPullRequest(org: string, getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachGitToken();
    const q = `GetPRFromGit?org=${org}&bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  async getOrgListFromSession() {
    const result = this.sessionStorage.get('ORG-LIST');
    if (!result) {
      this.getOrgList(false, true).subscribe(res => {
        if (res.code === 404) {
          console.log(`[E] getOrgListFromSession got 404`);
          return null;
        }
        this.sessionStorage.set('ORG-LIST', res);
        return res;
      });
    } else {
      return result;
    }
  }

  //Only status ask for Git call, everyone else go to SQL
  getOrgList(getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachToken(true);
    const q = `GetOrg?bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //org coming in here is Orgnization org, it is for OrgLink table
  getGitOrgList(org: string): any {
    this.attachGitToken(true);
    const q = `GetGitOrg?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  public getCurrentGitOrg(): string {
    this.currentGitOrg = this.sessionStorage.get('CURRENT-GIT-ORG');
    if (!this.currentGitOrg) {
      this.checkOrg().then(r => {
        return this.currentGitOrg;
      });
      return;
    }
    return this.currentGitOrg;
  }

  public async getCurrentOrg() {
    this.currentOrg = this.sessionStorage.get('CURRENT-ORG');
    if (!this.currentOrg) {
      this.checkOrg().then(r => {
        return this.currentOrg;
      });
    } else return this.currentOrg;
  }

  /*
  If current org is undefined, then get the org list and we get 404 then go back to login. 
  and this sets the currentOrg to firstOrg
  */
  async checkOrg() {
    return new Promise((resolve, reject) => {
      if (this.currentGitOrg === undefined || this.currentGitOrg === null || this.currentOrg === undefined || this.currentOrg === null) {
        console.log('[I] CheckOrg - getOrgList is called.');
        this.getOrgList().subscribe(result => {
          if (result.code === 404) {
            console.log('[E] CheckOrg - Unauthorize!!!');
            resolve(404);
            return;
          } else {
            console.log(`[S] Got orgs`);
          }
          this.sessionStorage.set('ORG-LIST', result);
          if (result.length > 0) {
            result.forEach(r => {
              if (r.OrgType === 'git') {
                this.currentGitOrg = r.Org;
                this.setCurrentGitOrg(r.Org);
              }
              if (r.OrgType === 'org') {
                this.currentOrg = r.Org;
                this.setCurrentOrg(r.Org);
              }
            });
            resolve(200);
          } else {
            reject(404);
          }
        });
      } else {
        resolve(200);
      }
    });
  }
  public setCurrentGitOrg(org: string) {
    if (org) {
      this.currentGitOrg = org;
      this.sessionStorage.set('CURRENT-GIT-ORG', org);
      this.broadecastGitOrgChanged(org);
    }
  }

  public setCurrentOrg(org: string) {
    if (org) {
      this.currentOrg = org;
      this.sessionStorage.set('CURRENT-ORG', org);
    }
  }

  attachToken(skipOrgCheck: boolean = false) {
    if (!skipOrgCheck) {
      this.checkOrg(); //Will not check if the call is coming from GetOrgList, else always does. Skip for GetOrg else it will be a infitite loop
    }
    this.token = this.storage.get('OrgToken');
    try {
      if (this.token) {
        // console.log(`[S] Token Found!`);
        this.httpOptions = {
          headers: new HttpHeaders({
            'X-GitHub-Delivery': 'xxx',
            'X-Hub-Signature': 'xxx',
            'X-GitHub-Event': 'xxx',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Content-Type': 'application/json', //x-www-form-urlencoded',
            Authorization: this.token,
          }),
        };
      } else {
        console.log('[E] NO TOKEN FOUND');
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  attachGitToken(skipOrgCheck: boolean = false) {
    if (!skipOrgCheck) {
      this.checkOrg(); //Will not check if the call is coming from GetOrgList, else always does. Skip for GetOrg else it will be a infitite loop
    }
    this.token = this.storage.get('GitToken');
    try {
      if (this.token) {
        // console.log(`[S] Token Found!`);
        this.httpOptions = {
          headers: new HttpHeaders({
            'X-GitHub-Delivery': 'xxx',
            'X-Hub-Signature': 'xxx',
            'X-GitHub-Event': 'xxx',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Content-Type': 'application/json', //x-www-form-urlencoded',
            Authorization: this.token,
          }),
        };
      } else {
        console.log('[E] NO TOKEN FOUND');
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  //All componenets call this to make sure that token is in place to call other calls.
  async ready(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.checkOrg().then(result => {
        resolve(true);
      });
    });
  }

  getDeveloperDetail(org: string, day: number = 7, login: string, action: string, pageSize: number = 20): Observable<any> {
    if  (!login)
       return null;

    if (!day) day = 7;

    const q = `PullRequest4Dev?org=${org}&day=${day}&login=${login}&action=${action}&pageSize=${pageSize}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getRepositoryPR(org: string, day: number = 7, repo: string, pageSize: number = 40): Observable<any> {
    if (!day) day = 7;

    const q = `GetRepositoryPR?org=${org}&day=${day}&repo=${repo}&pageSize=${pageSize}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //signup
  signup(token: string): Observable<any> {
    const q = `Signup?token=${token}`;
    return this.http.get(this.gitApiUrl + q);
  }

  // GetPullRequestCount for last 7 days, 30 days etc
  getPullRequestCount(org: string, login: string = null, day: number = 7): Observable<any> {
    if  (!login)
       return null;
    this.attachToken();
    const q = `PullRequestCountForLastXDays?org=${org}&login=${login}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  // GetTopRepositories for last 7 days, 30 days etc
  getTopRepositories(org: string, day: number = 7): Observable<any> {
    this.attachToken();
    // tslint:disable-next-line: max-line-length
    const q = `GetTopRespositories4XDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //Login,Name, Avatar_Url,UserName,UserDisplayName,Email, GitUserName,JiraUserName,TfsUserName
  getGitTopDevelopers(org: string, day: number): Observable<any> {
    this.attachToken();
    const q = `TopDevForLastXDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //org(Tenant)
  getAllUsers(org: string): Observable<any> {
    this.attachToken();
    const q = `GetAllUsers?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //Id, Email, UserName (is unique hence it is email too), UserOrg.Org, UserOrg.DisplayName as OrgDisplayName,
  //Users.DisplayName AS UserDisplayName, UserOrg.Active, UserOrg.OrgType,
  //dbo.Users.JiraUserName, dbo.Users.GitUserName, dbo.Users.TfsUserName
  getDev4Org(org: string): Observable<any> {
    this.attachToken();
    const q = `GetDev4Org?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getUser4Org(org: string): Observable<any> {
    this.attachToken();
    const q = `GetUser4Org?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getWatcher(org: string, gitOrg: string): Observable<any> {
    this.attachToken();
    const q = `GetWatcher?org=${org}&gitorg=${gitOrg}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getKudos(org: string, gitOrg: string): Observable<any> {
    this.attachToken();
    const q = `GetKudos?org=${org}&gitorg=${gitOrg}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getKudos4User(target: string): Observable<any> {
    this.attachToken();
    const q = `GetKudos4User?target=${target}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  setWatcher(watcher: string, target: string, org: string, gitOrg: string): Observable<any> {
    const q = `SetWatcher`;
    this.attachToken();
    let body: any = {
      watcher: watcher,
      target: target,
      org: org,
      gitorg: gitOrg,
    };
    // body = encodeURIComponent(JSON.stringify (body));
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  setKudos(sender: string, target: string, org: string, gitOrg: string, kudos: string): Observable<any> {
    const q = `SetKudos`;
    this.attachToken();
    let body: any = {
      sender: sender,
      target: target,
      org: org,
      gitorg: gitOrg,
      kudos: kudos,
    };
    // body = encodeURIComponent(JSON.stringify (body));
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  //Gets detail pull request
  getPullRequestForPastXDay(tenant: string, day: number): Observable<any> {
    this.attachToken();
    // tslint:disable-next-line: max-line-length
    const q = `PullRequestForLastXDays?day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getLoggedInUSerDetails(bustTheCache: boolean = false): Observable<any> {
    const q = `getLoggedInUSerDetails?bustTheCache=${bustTheCache}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*************** MSR  *******************/
  saveMSR(
    srId: number,
    userId: string,
    org: string,
    statusDetails: string,
    reviewer: string,
    status: number,
    links: string,
    manager: string,
    managerComment: string,
    managerStatus: number,
  ): Observable<any> {
    const q = `SaveMSR`;

    this.attachToken();
    let body: any = {
      srId: srId,
      org: org,
      userId: userId,
      statusDetails: statusDetails,
      reviewer: reviewer,
      status: status,
      links: links,
      manager: manager,
      managerComment: managerComment,
      managerStatus: managerStatus,
    };
    // body = encodeURIComponent(JSON.stringify (body));
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  getSR4User(userId: string, bustTheCache: boolean = false, pageSize: number = 100): Observable<any> {
    const q = `getSR4User?userid=${userId}&pageSize=${pageSize}&bustTheCache=${bustTheCache}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getSR4Id(srId: number, bustTheCache: boolean = false): Observable<any> {
    const q = `GetSR4Id?id=${srId}&bustTheCache=${bustTheCache}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  GetSR4User4Review(userId: string, status: number, userFilter: string, dateFilter: string, bustTheCache: boolean = false, pageSize: number = 100): Observable<any> {
    const q = `GetSR4User4Review?userid=${userId}&status=${status}&userFilter=${userFilter}&dateFilter=${dateFilter}
    &pageSize=${pageSize}&bustTheCache=${bustTheCache}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /******************  Jira  ****************/

  async setJiraOrg() {
    if (!this.jiraOrgList) {
      this.jiraOrgList = [];
    }
    if (this.jiraOrgList.length === 0) {
      await this.fillJiraOrgList();
    }
  }

  //Get all the users for all the org
  async fillJiraUserMap(): Promise<boolean> {
    let timer: any;
    await this.fillJiraOrgList();
    this.JiraUsersMap = new Map();
    return new Promise(async (done, fail) => {
      await this.jiraOrgList.forEach(element => {
        this.getJiraUsers(element.id, false).subscribe(result => {
          if (result.code === 401) {
            fail('401');
            return;
          }
          // console.log(`Found ${result.length} for ${element.name}`);
          result.forEach(e2 => {
            this.JiraUsersMap.set(e2.DisplayName.toLowerCase().trim(), e2.AccountId.trim());
          });
          //I hate it
          timer = setInterval(() => {
            done(true);
            clearInterval(timer);
            return;
          }, 1000);
        });
      });
    });
  }

  async getJiraOrgName4Id(val: string) {
    this.jiraOrgList.forEach(org => {
      if (org.id === val) {
        return org.name;
      }
    });
  }

  fillJiraOrgList(): Promise<boolean> {
    this.jiraOrgList = this.sessionStorage.get(this.JIRA_ORG_LIST);
    if (!_.isEmpty(this.jiraOrgList)) return;
    return new Promise((done, fail) => {
      if (!this.jiraOrgList) this.jiraOrgList = [];
      if (this.jiraOrgList.length === 0) {
        //lets fill JiraOrgList
        this.getJiraOrgs(false).subscribe(async result => {
          if (result.code === 401) {
            fail('401');
            return;
          }
          if (result.length > 0) {
            this.jiraOrgList = result;
            this.sessionStorage.set(this.JIRA_ORG_LIST, result);
            if (this.jiraCurrentOrg === undefined) {
              this.jiraCurrentOrg = this.jiraOrgList[0].id;
            }
          }
          done(true);
        });
      } else {
        done(true);
      }
    });
  }

  async getJiraAccountId4UserName(name: string): Promise<any> {
    if (_.isUndefined(this.JiraUsersMap.size) || this.JiraUsersMap.size === 0) {
      await this.fillJiraUserMap().then(() => {
        // console.log(`${name} => checked ${this.JiraUsersMap.size} values`);
        let x = this.JiraUsersMap.get(name.toLowerCase().trim());
        // console.log(` x => ${x}`);
        return x;
      });
    } else {
      // console.log(`'++ ${name} => checked ${this.JiraUsersMap.size} values`);
      return this.JiraUsersMap.get(name.toLowerCase().trim());
    }
  }

  /*
      Attaches Authorization ticket which actually has the tenant information (tenantId).
  */

  attachJiraToken() {
    this.jiraToken = this.storage.get('JiraToken');
    this.jiraTenant = this.jiraToken; //Token and tenant is same
    try {
      if (this.jiraToken) {
        this.httpJirapOptions = {
          headers: new HttpHeaders({
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Content-Type': 'text/html; charset=utf-8',
            Authorization: this.jiraToken,
          }),
        };
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  //Tenent goes in header
  GetJiraIssues(org: string, userid: string, pageSize: number = 40, bustTheCache: boolean = false): Observable<any> {
    const q = `GetJiraIssues?org=${org}&userid=${userid}&pageSize=${pageSize}`;
    this.attachJiraToken();
    return this.http.get(this.gitApiUrl + q, this.httpJirapOptions);
  }

  //Tenent goes in header
  GetJiraData(org: string, userid: string, pageSize: number = 40, bustTheCache: boolean = false): Observable<any> {
    const q = `GetJiraData?org=${org}&userid=${userid}&pageSize=${pageSize}&bustTheCache=${bustTheCache}`;
    this.attachToken(true);
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getJiraOrgs(bustTheCache: boolean = false): Observable<any> {
    const q = `GetJiraOrgs?bustTheCache=${bustTheCache}`;
    this.attachJiraToken();
    return this.http.get(this.gitApiUrl + q, this.httpJirapOptions);
  }

  getJiraUsers(org: string, bustTheCache: boolean = false): Observable<any> {
    const q = `GetJiraUsers?org=${org}&bustTheCache=${bustTheCache}`;
    this.attachJiraToken();
    return this.http.get(this.gitApiUrl + q, this.httpJirapOptions);
  }

  getJiraCurrentOrg() {
    return this.jiraCurrentOrg;
  }

  setJiraCurrentOrg(org: string) {
    if (org) {
      this.jiraCurrentOrg = org;
    }
  }

  getOrgChart(org: string, bustTheCache: boolean = false): Observable<any> {
    this.attachToken(true);
    const q = `GetOrgChart?bustTheCache=${bustTheCache}&org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //This post call will never be made if no one is listening to the return observable.
  saveOrgChart(userId: string, org: string, orgChart: string): Observable<any> {
    const q = `saveOrgChart`;
    this.attachToken();
    let body: any = {
      org: org,
      userId: userId,
      orgChart: orgChart,
    };
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  getUserRole(org: string, userid: string, bustTheCache: boolean = false): Observable<any> {
    const q = `getUserRole?org=${org}&userid=${userid}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  GetRepoParticipation4Login(org: string, login: string, days: number, bustTheCache: boolean = false): Observable<any> {
    const q = `GetRepoParticipation4Login?org=${org}&login=${login}&days=${days}&bustTheCache='false'`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getRole4Org(org: string, bustTheCache: boolean = false): Observable<any> {
    const q = `getRole4Org?org=${org}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  isUserAdmin(org: string, userid: string, bustTheCache: boolean = false): Observable<any> {
    const q = `isUserAdmin?org=${org}&userid=${userid}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  isUserMSRAdmin(org: string, userid: string, bustTheCache: boolean = false): Observable<any> {
    const q = `isUserMSRAdmin?org=${org}&userid=${userid}`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  saveUserRole(userIds: string, org: string, role: string): Observable<any> {
    const q = `saveUserRole`;
    this.attachToken();
    let body: any = {
      org: org,
      userId: userIds,
      role: role,
    };
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  updateUserConnectIds(user: any): Observable<any> {
    const q = `updateUserConnectIds`;
    this.attachToken();
    let body: any = {
      user: user,
    };
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  deleteUserRole(userIds: string, org: string, role: string): Observable<any> {
    const q = `deleteUserRole`;
    this.attachToken();
    let body: any = {
      org: org,
      userId: userIds,
      role: role,
    };
    return this.http.post(this.gitApiUrl + q, body, this.httpOptions);
  }

  getOrgTree(org: string, userId: string, bustTheCache: boolean = false): Observable<any> {
    const q = `getOrgTree?org=${org}&userId=${userId}&bustTheCache='false'`;
    this.attachToken();
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }
}
