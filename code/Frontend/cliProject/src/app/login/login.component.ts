import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AuthenticationService} from '../_services/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';

@Component({
  templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private notService: NotificationsService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.model.username, this.model.password)
      .subscribe(
        data => {
          if (data.ok) {
            this.notService.success('Logged in!','');
            this.router.navigate(['/']);
          } else {
            this.notService.error('Login failed',data.errorMsg);
            this.loading = false;
          }
        },
        error => {
          this.notService.error('login error',error);
          this.loading = false;
        });
  }
}
