import {Injectable, Input, Inject, Optional, SkipSelf} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {LOCAL_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {Router} from '@angular/router';
import {promise} from 'protractor';
import {resolve} from 'path';
import {reject} from 'q';

@Injectable({
  providedIn: 'root',
})
export class GitService {
  httpOptions: any;
  query: string;
  token: string;
  tenant: string;
  public organization: string;
 
  public gatorApiUrl =  'https://gator-api.azurewebsites.net'; //'http://localhost:3000'; // process.env.SERVICE_URL; // 'https://gator-api.azurewebsites.net';
  public gitApiUrl: string = this.gatorApiUrl + '/service/';  

  //Components listen to each other using this
  private _onMyEvent = new Subject<string>();

  //return the event as observable so others can subscribe to it
  public get onMyEvent(): Observable<string> {
    return this._onMyEvent.asObservable();
  }

  public currentOrg: string;

  /* 
   Component calls this trigger

   pullRequestCount it with "Action -day" and Top-developer calls it with developer name

   DevPullDetailsComponent is subscribing it
     this.gitService.onMyEvent.subscribe((val: string) => {
  */
  public trigger(value: string) {
    this._onMyEvent.next(value);
  }

  constructor(private http: HttpClient, @Inject(LOCAL_STORAGE) private storage: WebStorageService, private router: Router, @Optional() @SkipSelf() parentmodule: GitService) {
    if (parentmodule) {
      throw new Error('GitService is already loaded. Import it in ONLY AppModule');
    }
    this.checkOrg();
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

  /*
  This is not called very often, only called from status - So it is ok to go to git
  */

  getRepoList(org: string,getFromGit: boolean = false, bustTheCache: boolean = false): any {
    this.attachToken();
    const q = `GetRepos?org=${org}&bustTheCache=${bustTheCache}&getFromGit=${getFromGit}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  /*
  This is not called very often, only called from status - only status goes to git
  */
  getPullRequest(org: string,getFromGit: boolean = false, bustTheCache: boolean = false): any {
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

  attachToken(skipOrgCheck: boolean = false) {
    if (!skipOrgCheck) {
      this.checkOrg(); //Will not check if the call is coming from GetOrgList, else always does. Skip for GetOrg else it will be a infitite loop
    }
    if (!this.token) {
      this.token = this.storage.get('token');
      this.tenant = this.token; //Token and tenant is same
    }
    try {
      if (this.token) {
        this.httpOptions = {
          headers: new HttpHeaders({
            'X-GitHub-Delivery': 'xxx',
            'X-Hub-Signature': 'xxx',
            'X-GitHub-Event': 'xxx',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Content-Type': 'text/html; charset=utf-8',
            Authorization: this.token,
          }),
        };
      }
    } catch (ex) {
      console.log(ex);
    }
  }

 /*
  If current org is undefined, then get the org list and we get 404 then go back to login. 
  */
 async checkOrg() {
  return new Promise((resolve, reject) => {
    if (this.currentOrg === undefined) {
      this.getOrgList().subscribe(result => {
        if (result.code === 404) {
          this.router.navigate(['/login']);
        }
        if (result.length > 0) {
          if (!this.currentOrg) {
              this.currentOrg = result[0].Org;
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
  getPullRequestCount(org: string, day: number = 7): Observable<any> {
    this.attachToken();
    const q = `PullRequestCountForLastXDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  // GetTopRepositories for last 7 days, 30 days etc
  getTopRepositories(org: string, day: number = 7): Observable<any> {
    this.attachToken();
    // tslint:disable-next-line: max-line-length
    const q = `GetTopRespositories4XDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  getTopDevelopers(org: string, day: number): Observable<any> {
    this.attachToken();
    const q = `TopDevForLastXDays?org=${org}&day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }

  //Gets detail pull request
  getPullRequestForPastXDay(tenant: string, day: number): Observable<any> {
    this.attachToken();
    // tslint:disable-next-line: max-line-length
    const q = `PullRequestForLastXDays?day=${day}`;
    return this.http.get(this.gitApiUrl + q, this.httpOptions);
  }
}
