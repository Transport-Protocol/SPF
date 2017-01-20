import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from '../_services/index';
import {NotificationsService} from "angular2-notifications/lib/notifications.service";
import {Response} from "@angular/http";

@Component({
  templateUrl: 'register.component.html'
})

export class RegisterComponent {
  model: any = {};
  loading = false;

  constructor(private router: Router,
              private userService: UserService,
              private notService: NotificationsService) {
  }


  register() {
    if(this.model.password !== this.model.password2){
      this.notService.error('Registration failed','passwords are not the same');
      return;
    }
    if (typeof this.model.username === 'undefined'){
      this.notService.error('Registration failed','username is empty');
      return;
    }
    if (typeof this.model.password === 'undefined'){
      this.notService.error('Registration failed','password is empty');
      return;
    }
    this.loading = true;
    this.userService.create(this.model)
      .subscribe(
        data => {
          if(data instanceof Response) {
            data = data.json();
            var registerAnswer = data;
            if (!registerAnswer.ok) {
              this.notService.alert('Registration failed', registerAnswer.errorMsg);
              this.loading = false;
            } else {
              this.notService.success('Registration successful', '');
              this.router.navigate(['/login']);
            }
          }
        },
        error => {
          this.notService.error('Registration error',error);
          this.loading = false;
        });
  }
}
