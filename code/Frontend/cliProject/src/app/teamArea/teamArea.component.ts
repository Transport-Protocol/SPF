import {Component} from '@angular/core';

import {User,Team} from '../_models/index';
import {CreateTeamComponent} from '../create-team/create-team.component';
import {ChangeTeamComponent} from '../change-team/change-team.component';
import {ViewContainerRef} from '@angular/core';
import {MdDialog, MdDialogRef, MdDialogConfig} from '@angular/material';
import {InformNewTeamService} from "../_services/inform-new-team.service";
import {JoinTeamComponent} from "../join-team/join-team.component";

@Component({
  selector: 'teamArea',
  templateUrl: 'teamArea.component.html',
})

export class TeamAreaComponent {
  currentUser: User;
  currentTeam: Team;
  createDialogRef: MdDialogRef<CreateTeamComponent>;
  changeDialogRef: MdDialogRef<ChangeTeamComponent>;
  joinDialogRef: MdDialogRef<JoinTeamComponent>;
  lastCloseResult: string;
  config: MdDialogConfig;
  hasTeam: boolean;
  selectedTeam: string = 'none';

  constructor(private informNewTeamService: InformNewTeamService,public dialog: MdDialog, public viewContainerRef: ViewContainerRef) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(localStorage.getItem('currentTeam')){
      this.setTeam();
    }
    this.config = {
      role: 'dialog',
      viewContainerRef: this.viewContainerRef
    };
    informNewTeamService.newTeam$.subscribe(
      hasTeam => {
        if(hasTeam){
          this.setTeam();
          this.dialog.closeAll();
        }
      });
  }

  setTeam(){
    this.currentTeam = JSON.parse(localStorage.getItem('currentTeam'));
    this.hasTeam = true;
  }

  openChangeTeamDialog() {
    this.changeDialogRef = this.dialog.open(ChangeTeamComponent, this.config);
    this.changeDialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.changeDialogRef = null;
    });
  }

  openCreateTeamDialog() {
    this.createDialogRef = this.dialog.open(CreateTeamComponent, this.config);
    this.createDialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.createDialogRef = null;
    });
  }

  openJoinTeamDialog() {
    this.joinDialogRef = this.dialog.open(JoinTeamComponent, this.config);
    this.joinDialogRef.afterClosed().subscribe(result => {
      this.lastCloseResult = result;
      this.joinDialogRef = null;
    });
  }

}
