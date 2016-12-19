import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {AuthenticationService} from '../_services/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {
  services: ServiceAuth[] = [];
  loading: boolean = false;
  subscription: any;
  timerDelay: number = 5000;
  timerIntervall: number = 5000;

  constructor(private authenticationService: AuthenticationService, private notService: NotificationsService) {
    this.fillAuths();
  }

  ngOnInit() {
    this.getAuthList();
    this.getAuthUrls();
    let timer = Observable.timer(this.timerDelay, this.timerIntervall); //delay 5 sec,intervall 5 sec
    this.subscription = timer.subscribe(t => {
      this.getAuthList();
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  stopTimer() {
    this.subscription.unsubscribe();
  }

  getAuthList() {
    this.loading = true;
    this.authenticationService.authList()
      .subscribe(
        data => {
          if (data.ok) {
            for (let i = 0; i < data.list.length; i++) {
              this.updateServiceStatus(data.list[i]);
            }
            this.loading = false;
          } else {
            this.notService.error('could not retrieve authentication status list', data.errorMsg);
            this.loading = false;
          }
        },
        error => {
          this.notService.error('could not retrieve authentication status list', error);
          this.loading = false;
        });

  }

  getAuthUrls() {
    for (let i = 0; i < this.services.length; i++) {
      if (this.services[i].type === 'oauth2' && !this.services[i].status) {
        this.services[i].loading = true;
        this.authenticationService.oauth2Link(this.services[i].name.toLowerCase())
          .subscribe(
            data => {
              if (data.ok) {
                this.services[i].authUrl = data.url;
                this.services[i].loading = false;
              } else {
                this.notService.error('could not retrieve auth url for service: ' + this.services[i].name, data.errorMsg);
                this.services[i].loading = false;
              }
            },
            error => {
              this.notService.error('could not retrieve auth url for service: ' + this.services[i].name, error);
              this.services[i].loading = false;
            });
      }
    }
  }

  updateServiceStatus(service: string) {
    for (let i = 0; i < this.services.length; i++) {
      if (this.services[i].name.toLowerCase() === service.toLowerCase()) {
        this.services[i].status = true;
      }
    }
  }

  sendBasicAuth(service: string, username: string, password: string) {
    var target = this.getServiceByName(service);
    target.loading = true;
    this.authenticationService.setBasicAuthOfService(service,username,password)
      .subscribe(
        data => {
          target.loading = false;
          if (data.ok) {
          } else {
            this.notService.error('could not set basicauth', data.errorMsg);
          }
        },
        error => {
          target.loading = false;
          this.notService.error('could not set basicauth', error);
        });
  }

  getServiceByName(servicename: string){
    for(let i = 0;i<this.services.length;i++){
      if(this.services[i].name === servicename){
        return this.services[i];
      }
    }
  }

  fillAuths() {
    this.services[0] = {
      name: 'Dropbox',
      type: 'oauth2',
      status: false,
      loading: true,
      authUrl: ''
    };
    this.services[1] = {
      name: 'Owncloud',
      type: 'basic',
      status: false,
      loading: false,
      authUrl: ''
    };
    this.services[2] = {
      name: 'Google',
      type: 'oauth2',
      status: false,
      loading: true,
      authUrl: ''
    };
    this.services[3] = {
      name: 'Bitbucket',
      type: 'oauth2',
      status: false,
      loading: true,
      authUrl: ''
    };
    this.services[4] = {
      name: 'Github',
      type: 'oauth2',
      status: false,
      loading: true,
      authUrl: ''
    };
    this.services[5] = {
      name: 'Slack',
      type: 'oauth2',
      status: false,
      loading: true,
      authUrl: ''
    };
  }

}

interface ServiceAuth {
  name: string;
  type: string;
  status: boolean;
  loading: boolean;
  authUrl: string;
}
