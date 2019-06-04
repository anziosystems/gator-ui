import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
//import {AppRoutingModule} from './app-routing.module';
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
import {GitService} from './git-service';
import {LOCAL_STORAGE, StorageServiceModule} from 'angular-webstorage-service';
import {StatusComponent} from './status/status.component';
import {OrgListComponent} from './org-list/org-list.component';
import { AuthService,AuthWebService, AuthInterceptor, OidcNavigationService, NgxCoreServicesModule, Config ,ConfigService,SessionStorageService} from '@labshare/ngx-core-services';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'callback', component: CallbackComponent},
  {path: 'status', component: StatusComponent},
  {path: 'orglist', component: OrgListComponent},
  {path: 'dashboard', component: DashboardComponent, runGuardsAndResolvers: 'paramsOrQueryParamsChange'},
  {path: '', component: DashboardComponent},
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
    
  ],
  imports: [
    BrowserModule,
    NgxCoreServicesModule.forRoot(environment as Config),
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),

    // AppRoutingModule, // TopNavModule, LeftNavModule, //FitWindowModule,
    StorageServiceModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [GitService, CookieService],
  exports: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
