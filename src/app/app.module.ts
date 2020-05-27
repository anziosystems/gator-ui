import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {environment} from '../environments/environment';
import {GitService, DevDetails} from './git-service';
import {LOCAL_STORAGE, StorageServiceModule} from 'ngx-webstorage-service';
import {StatusComponent} from './status/status.component';
import {OrgListComponent} from './org-list/org-list.component';
import {ContextMenuModule} from 'ngx-contextmenu';
import {QuillModule} from 'ngx-quill';
import {HookErrorComponent} from './hook-error/hook-error.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
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
import {DialogModule} from 'primeng/dialog';
import {DialogService} from 'primeng/dynamicdialog';
import {MessageService} from 'primeng/api';
import {TreeModule} from 'primeng/tree';
import {ToastModule} from 'primeng/toast';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {ChartModule, CalendarModule, SharedModule, MessageModule, MessagesModule} from 'primeng';
import {CardModule} from 'primeng/card';
import {ConfirmationService} from 'primeng/api';
import {PeopleTicketComponent} from './people-ticket/people-ticket.component';
import {SettingsComponent} from './settings/settings.component';
import {AdminComponent} from './admin/admin.component';
// import {PaymentComponent} from './payment/payment.component';
import {IcReportComponent} from './ic-report/ic-report.component';
import {IcCountsComponent} from './ic-counts/ic-counts.component';
import {AboutComponent} from './about/about.component';
import {OrgChartComponent} from './org-chart/org-chart.component';
import {HomeComponent} from './home/home.component';
import {ContactusComponent} from './contactus/contactus.component';
import {HelpComponent} from './help/help.component';
import {OrgDetailsComponent} from './org-details/org-details.component';
import {LinebarComponent} from './linebar/linebar.component';
import {TfsLoginComponent} from './tfs-login/tfs-login.component';
import {TfsStatusComponent} from './tfs-status/tfs-status.component';
import {TfscallbackComponent} from './tfscallback/tfscallback.component';
import {CandidateDetailComponent} from './candidate-detail/candidate-detail.component';
import {LsauthComponent} from './lsauth/lsauth.component';
import {LsauthCallbackComponent} from './lsauth-callback/lsauth-callback.component';
import {TenantqComponent} from './tenantq/tenantq.component';
import {ConnectIdsComponent} from './connect-ids/connect-ids.component';
import {PrivacyComponent} from './privacy/privacy.component';
import {SignupComponent} from './signup/signup.component';
import {HydrateComponent} from './hydrate/hydrate.component';
import { AllUserComponent } from './all-user/all-user.component';

const routes: Routes = [
  {path: 'privacy', component: PrivacyComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'cd', component: CandidateDetailComponent},
  {path: 'linebar', component: LinebarComponent},
  {path: 'help', component: HelpComponent},
  {path: 'od', component: OrgDetailsComponent},
  {path: 'home', component: HomeComponent},
  {path: 'contact', component: ContactusComponent},
  {path: 'about', component: AboutComponent},
  {path: 'tenantq', component: TenantqComponent},
  {path: 'lsauth', component: LsauthComponent},
  {path: 'bitbucketlogin', component: BitbucketLoginComponent},
  {path: 'callback', component: CallbackComponent},
  {path: 'jiraCallback', component: JiraCallBackComponent},
  {path: 'lsauthCallback', component: LsauthCallbackComponent},
  {path: 'tfsCallback', component: TfscallbackComponent},
  {path: 'bitbucketCallback', component: BitbucketCallBackComponent},
  {path: 'StatusReport', component: StatusReportsComponent},
  {path: 'status', component: StatusComponent},
  {path: 'jiraStatus', component: JiraStatusComponent},
  {path: 'tfsStatus', component: TfsStatusComponent},

  {path: 'icReport', component: IcReportComponent},
  {path: 'orgChart', component: OrgChartComponent},
  {path: 'bitbucketStatus', component: BitbucketStatusComponent},
  {
    path: 'settings',
    component: SettingsComponent,
    children: [
      {path: 'admin', component: AdminComponent},
      {path: 'connentIds', component: ConnectIdsComponent},
      {path: 'hydrate', component: HydrateComponent},
    ],
  },
  //auth/lsauth
  {path: 'orglist', component: OrgListComponent},
  {path: 'hook-error', component: HookErrorComponent},
  {path: 'jira-login', component: JiraLoginInComponent},
  {path: 'tfs-login', component: TfsLoginComponent},
  {path: 'dashboard', component: DashboardComponent, runGuardsAndResolvers: 'paramsOrQueryParamsChange'},
  {path: ':tenant', component: LsauthComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: '**', redirectTo: 'home', pathMatch: 'full'},
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
    PeopleTicketComponent,
    SettingsComponent,
    AdminComponent,
    // PaymentComponent,
    IcReportComponent,
    IcCountsComponent,
    AboutComponent,
    OrgChartComponent,
    HomeComponent,
    ContactusComponent,
    HelpComponent,
    OrgDetailsComponent,
    LinebarComponent,
    TfsLoginComponent,
    TfsStatusComponent,
    TfscallbackComponent,
    CandidateDetailComponent,
    LsauthComponent,
    LsauthCallbackComponent,
    TenantqComponent,
    ConnectIdsComponent,
    PrivacyComponent,
    SignupComponent,
    HydrateComponent,
    AllUserComponent,
  ],
  entryComponents: [PeopleTicketComponent],
  imports: [
    BrowserModule,
    TreeModule,
    CardModule,
    CalendarModule,
    SharedModule,
    ChartModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    ConfirmDialogModule,
    ContextMenuModule.forRoot(),
    QuillModule.forRoot(),
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),
    StorageServiceModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularDraggableModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    DialogModule,
  ],
  providers: [GitService, DialogService, MessageService, ConfirmationService],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
