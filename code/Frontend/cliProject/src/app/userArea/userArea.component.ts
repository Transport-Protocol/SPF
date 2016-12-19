import {Component} from '@angular/core';

import {UserService} from '../_services/index';
import {User} from '../_models/index';
import {AuthSettingsComponent} from "../auth-settings/auth-settings.component";
import {ViewContainerRef} from '@angular/core';
import {MdDialog, MdDialogRef, MdDialogConfig} from '@angular/material';


@Component({
  selector: 'userArea',
  templateUrl: 'userArea.component.html'
})

export class UserAreaComponent {
  currentUser: User;
  dialogRef: MdDialogRef<AuthSettingsComponent>;
  lastCloseResult: string;
  config: MdDialogConfig;

  constructor(private userService: UserService, public dialog: MdDialog, public viewContainerRef: ViewContainerRef) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.config = {
      role: 'dialog',
      viewContainerRef: this.viewContainerRef
    };
  }

  openAuthSettingsDialog() {
    this.dialogRef = this.dialog.open(AuthSettingsComponent, this.config);
    this.dialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.dialogRef = null;
    });
  }
}
