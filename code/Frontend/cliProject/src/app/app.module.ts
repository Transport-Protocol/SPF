import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, JsonpModule} from '@angular/http';
import {MaterialModule, MdIconRegistry, OVERLAY_PROVIDERS, MdDialog, InteractivityChecker} from '@angular/material';
import {AppComponent} from './app.component';
import {routing}        from './app.routing';
import {Ng2MaterialModule} from 'ng2-material';

import {ChangeBgColorDirective, ScrollIntoViewDirective} from './_directives/index';
import {AuthGuard} from './_guards/index';
import {
  AuthenticationService,
  UserService,
  FileStorageService,
  ActiveTabService,
  TeamService,
  VersionControlService,
  InformNewTeamService,
  SlackService,
  AbstractFileStorageService
} from './_services/index';
import {HomeComponent} from './home/index';
import {LoginComponent} from './login/index';
import {RegisterComponent} from './register/index';
import {TeamAreaComponent} from './teamArea/teamArea.component';
import {UserAreaComponent} from './userArea/userArea.component';
import {ServiceSelectionComponent} from './serviceSelection/serviceSelection.component';
import {FileStorageComponent} from './fileStorage/fileStorage.component';
import {AbstractFileStorageComponent} from './abstractFileStorage/abstractFileStorage.component';
import {VersionControlComponent} from './versionControl/versionControl.component';
import {SimpleNotificationsModule} from "angular2-notifications/lib/simple-notifications.module";
import {NotificationsService} from "angular2-notifications/lib/notifications.service";
import {AuthSettingsComponent} from './auth-settings/auth-settings.component';

import {APP_CONFIG, AppConfig} from './_models/app.config';
import {CreateTeamComponent} from './create-team/create-team.component';
import {ChangeTeamComponent} from './change-team/change-team.component';
import {JoinTeamComponent} from './join-team/join-team.component';
import {SlackComponent} from './slack/slack.component';


import {XHRBackend} from '@angular/http';
import {CustomBackend} from './_services/CustomBackend';

import {FileSizePipe} from './_pipes/fileSize.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    TeamAreaComponent,
    UserAreaComponent,
    ServiceSelectionComponent,
    FileStorageComponent,
    AbstractFileStorageComponent,
    VersionControlComponent,
    ChangeBgColorDirective,
    ScrollIntoViewDirective,
    AuthSettingsComponent,
    CreateTeamComponent,
    ChangeTeamComponent,
    JoinTeamComponent,
    SlackComponent,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    Ng2MaterialModule.forRoot(),
    JsonpModule,
    routing,
    SimpleNotificationsModule
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    UserService,
    TeamService,
    FileStorageService,
    VersionControlService,
    NotificationsService,
    ActiveTabService,
    InformNewTeamService,
    SlackService,
    AbstractFileStorageService,
    OVERLAY_PROVIDERS,
    MdIconRegistry,
    MdDialog,
    InteractivityChecker,
    {provide: APP_CONFIG, useValue: AppConfig},
    CustomBackend,
    {provide: XHRBackend, useExisting:CustomBackend}
  ],
  entryComponents: [
    AuthSettingsComponent,
    CreateTeamComponent,
    ChangeTeamComponent,
    JoinTeamComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
