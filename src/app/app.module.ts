import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {PullRequestCountComponent} from './pull-request-count/pull-request-count.component';
import {HttpClientModule} from '@angular/common/http';
import {TopRepositoryComponent} from './top-repository/top-repository.component';
import {TopDevelopersComponent} from './top-developers/top-developers.component';
import {DevPullDetailsComponent} from './dev-pull-details/dev-pull-details.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CallbackComponent} from './callback/callback.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {Routes, RouterModule} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../environments/environment';
import {GitService, DevDetails} from './git-service';
import {LOCAL_STORAGE, StorageServiceModule} from 'angular-webstorage-service';
import {StatusComponent} from './status/status.component';
import {OrgListComponent} from './org-list/org-list.component';
import {ContextMenuModule} from 'ngx-contextmenu';
import {QuillModule} from 'ngx-quill';
import {HookErrorComponent} from './hook-error/hook-error.component';
import {PrchartComponent} from './prchart/prchart.component';
import {AngularDraggableModule} from 'angular2-draggable';
import {TweetsComponent} from './tweets/tweets.component';
import {BreakingnewsComponent} from './breakingnews/breakingnews.component';
import {DevJiraDetailsComponent} from './dev-jira-details/dev-jira-details.component';
import {JiraLoginInComponent} from './jira-login-in/jira-login-in.component';
import {JiraCallBackComponent} from './jira-call-back/jira-call-back.component';
import {JiraStatusComponent} from './jira-status/jira-status.component';
import {BitbucketLoginComponent} from './bitbucket-login/bitbucket-login.component';
import {BitbucketCallBackComponent} from './bitbucket-call-back/bitbucket-call-back.component';
import {BitbucketStatusComponent} from './bitbucket-status/bitbucket-status.component';
import {StatusReportsComponent} from './status-reports/status-reports.component';
 

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'bitbucketlogin', component: BitbucketLoginComponent},
  {path: 'callback', component: CallbackComponent},
  {path: 'jiraCallback', component: JiraCallBackComponent},
  {path: 'bitbucketCallback', component: BitbucketCallBackComponent},
  {path: 'StatusReport', component: StatusReportsComponent},
  {path: 'status', component: StatusComponent},
  {path: 'jiraStatus', component: JiraStatusComponent},
  {path: 'bitbucketStatus', component: BitbucketStatusComponent},

  {path: 'orglist', component: OrgListComponent},
  {path: 'hook-error', component: HookErrorComponent},
  {path: 'prchart', component: PrchartComponent},
  {path: 'jira-login', component: JiraLoginInComponent},
  {path: 'dashboard', component: DashboardComponent, runGuardsAndResolvers: 'paramsOrQueryParamsChange'},
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    PullRequestCountComponent,
    TopRepositoryComponent,
    TopDevelopersComponent,
    DevPullDetailsComponent,
    LoginComponent,
    DashboardComponent,
    CallbackComponent,
    StatusComponent,
    OrgListComponent,
    HookErrorComponent,
    PrchartComponent,
    TweetsComponent,
    BreakingnewsComponent,
    DevJiraDetailsComponent,
    JiraLoginInComponent,
    JiraCallBackComponent,
    JiraStatusComponent,
    BitbucketLoginComponent,
    BitbucketCallBackComponent,
    BitbucketStatusComponent,
    StatusReportsComponent,
  ],
  imports: [
    BrowserModule,
    ContextMenuModule.forRoot(),
    QuillModule.forRoot(),
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),
    StorageServiceModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularDraggableModule,
    FormsModule,
    
  ],
  providers: [GitService, CookieService],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
