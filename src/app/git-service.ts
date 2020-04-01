import {Injectable, Input, Inject, Optional, SkipSelf} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {LOCAL_STORAGE, SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {Router} from '@angular/router';
import {promise} from 'protractor';
import {resolve} from 'path';
import {reject} from 'q';
import {typeWithParameters} from '@angular/compiler/src/render3/util';
import {timingSafeEqual} from 'crypto';

/*
Jira calls must have following in the header

req.headers['jiraOrg'];  //AccessibleResources Id
req.headers['jiraAuthorization'];  //This is JiraTenant Id

*/

export class DevDetails {
  public name: string;
  public image: string;
  public login: string;
  public id: number;
  public profileUrl: string;
  public avatarUrl: string;
  public email: string;
  public tenantId: number;
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
  private currentOrg: string;
  private jiraCurrentOrg: string;
  private token: string;
  private jiraToken: string;
  private tenant: string; //token and tenant is same today
  private jiraTenant: string;
  private loggedInGitDev: DevDetails;
  private currentDev: DevDetails;
  private currentContext: string; //JIRA/GIT
  private gitUsersMap = new Map<string, DevDetails>();
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

  public gatorApiUrl = 'https://gator-api.azurewebsites.net'; // process.env.SERVICE_URL; // 'https://gator-api.azurewebsites.net';
  //public gatorApiUrl = 'http://localhost:3000'; // process.env.SERVICE_URL; // 'https://gator-api.azurewebsites.net';
  public gitApiUrl: string = this.gatorApiUrl + '/service/';

  //Components listen to each other using this
  private _onCustomEvent = new Subject<CustomEvent>();
  private _onMyEvent = new Subject<string>();
  private _onJiraEvent = new Subject<string>();
  private _onComponentMessage = new Subject<string>();
  private _isLoggedIn = new Subject<boolean>();

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
    this.getLoggedInGitDev();
    this.getCurrentOrg();
    this.getCurrentDev();

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
      if (dev.name) {
        this.currentDev = dev;
        this.sessionStorage.set('CURRENT-DEV', dev);
      }
    }
  }

  //This current dev is about which dev is clicked on TopDev and other places. If you want to know the current logged in user then call
  //getGitLoggedInUSerDetails

  getCurrentDev(): DevDetails {
    if (!this.currentDev) {
      this.currentDev = this.sessionStorage.get('CURRENT-DEV');
    }
    if (!this.currentDev.login) {
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

  public setLoggedInGitDev(v: DevDetails) {
    if (v) {
      if (v.login) {
        this.loggedInGitDev = new DevDetails();
        this.loggedInGitDev.name = v.name;
        this.loggedInGitDev.image = v.image;
        this.loggedInGitDev.login = v.login;
        this.loggedInGitDev.id = v.id;
        this.loggedInGitDev.profileUrl = v.profileUrl;
        this.sessionStorage.set('LOGGEDIN_USER', v);
      }
    }
  }

  //Gets Current loggedIn User
  public getLoggedInGitDev(): DevDetails {
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

  async fillGitUserMap(): Promise<boolean> {
    return new Promise((done, fail) => {
      this.getGitDev4Org(this.getCurrentOrg()).subscribe(result => {
        if (result.code === 401) {
          fail('401');
          return;
        }
        result.forEach(e2 => {
          let dd = new DevDetails();
          dd.name = e2.Name;
          dd.login = e2.Login;
          dd.avatarUrl = e2.AvatarUrl;
          dd.email = e2.email;
          dd.tenantId = e2.TenantId;
          this.gitUsersMap.set(e2.login.trim(), dd);
        });
        done(true);
        return;
      });
    });
  }

  getGitDisplayName4Login(login: string): Promise<string> {
    return new Promise((done, fail) => {
      try {
        if (this.gitUsersMap.size === 0) {
          this.fillGitUserMap().then(x => {
            let v = this.gitUsersMap.get(login);
            done(v.name);
          });
        } else {
          done(this.gitUsersMap.get(login).name);
        }
      } catch (ex) {
        fail(ex);
      }
    });
  }

  //wrong check
  getGitDevDetails4Login(login: string): Promise<DevDetails> {
    return new Promise((done, fail) => {
      try {
        if (this.gitUsersMap.size === 0) {
          this.fillGitUserMap().then(x => {
            done(this.gitUsersMap.get(login));
          });
        } else {
          done(this.gitUsersMap.get(login));
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

  public get onMyEvent(): Observable<string> {
    return this._onMyEvent.asObservable();
  }

  public get onCustomEvent(): Observable<CustomEvent> {
    return this._onCustomEvent.asObservable();
  }

  public get onJiraEvent(): Observable<string> {
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

  public trigger(value: string) {
    this._onMyEvent.next(value);
  }

  public triggerCustomEvent(value: CustomEvent) {
    this._onCustomEvent.next(value);
  }

  public triggerJira(value: string) {
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

  getGraphData4XDays(org: string, login: string = null, day: number): any {
    this.attachToken();
    // let org = this.currentOrg ;
    const q = `GetGraphData4XDays?org=${org}&login=${login}&day=${day}`;

    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*
  This is not called very often, only called from status - So it is ok to go to git
  */

  getRepoList(org: string, getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachToken();
    const q = `GetRepos?org=${org}&bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*
  This is not called very often, only called from status - only status goes to git
  */
  getPullRequest(org: string, getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachToken();
    const q = `GetPRfromGit?org=${org}&bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //Only status ask for Git call, everyone else go to SQL
  getOrgList(getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachToken(true);
    const q = `GetOrg?bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  public getCurrentOrg(): string {
    this.currentOrg = this.sessionStorage.get('CURRENT-ORG');
    if (!this.currentOrg) {
      this.checkOrg().then(r => {
        return this.currentOrg;
      });
      return;
    }

    return this.currentOrg;
  }

  /*
  If current org is undefined, then get the org list and we get 404 then go back to login. 
  and this sets the currentOrg to firstOrg
  */
  async checkOrg() {
    return new Promise((resolve, reject) => {
      if (this.currentOrg === undefined || this.currentOrg === null) {
        this.getOrgList().subscribe(result => {
          if (result.code === 404) {
            console.log('CheckOrg - Unauthorize!!!');
            this.router.navigate(['/login']);
          }
          if (result.length > 0) {
            this.currentOrg = result[0].Org;
            if (!this.currentOrg) {
              this.setCurrentOrg(result[0].Org);
            }
            resolve();
          } else {
            reject();
          }
        });
      } else {
        resolve();
      }
    });
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

    this.token = this.storage.get('token');
    this.tenant = this.token; //Token and tenant is same

    try {
      if (this.token) {
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

  // GetPullRequestCount for last 7 days, 30 days etc
  getPullRequestCount(org: string, login: string = null, day: number = 7): Observable<any> {
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

  getGitTopDevelopers(org: string, day: number): Observable<any> {
    this.attachToken();
    const q = `TopDevForLastXDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getGitDev4Org(org: string): Observable<any> {
    this.attachToken();
    const q = `GitDev4Org?org=${org}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //Gets detail pull request
  getPullRequestForPastXDay(tenant: string, day: number): Observable<any> {
    this.attachToken();
    // tslint:disable-next-line: max-line-length
    const q = `PullRequestForLastXDays?day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getGitLoggedInUSerDetails(bustTheCache: boolean = false): Observable<any> {
    const q = `getGitLoggedInUSerDetails?bustTheCache=${bustTheCache}`;
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

  async fillJiraUserMap(): Promise<boolean> {
    await this.fillJiraOrgList();
    return new Promise((done, fail) => {
      this.jiraOrgList.forEach(element => {
        this.getJiraUsers(element.id, false).subscribe(result => {
          if (result.code === 401) {
            fail('401');
            return;
          }
          result.forEach(e2 => {
            this.JiraUsersMap.set(e2.DisplayName.trim(), e2.AccountId.trim());
          });
          done(true);
          return;
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
    if (this.jiraOrgList) return;
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
    if (this.JiraUsersMap.size === 0) {
      await this.fillJiraUserMap();
    } else {
      return this.JiraUsersMap.get(name);
    }
    return this.JiraUsersMap.get(name);
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
}
