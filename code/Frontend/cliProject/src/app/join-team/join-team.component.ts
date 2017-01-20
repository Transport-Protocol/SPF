import {Component} from '@angular/core';
import {TeamService} from '../_services/index';
import {Team} from "../_models/team";
import {MdDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {Response} from "@angular/http";

@Component({
  selector: 'app-join-team',
  templateUrl: './join-team.component.html',
  styleUrls: ['./join-team.component.scss']
})
export class JoinTeamComponent {
  model: any = {};
  loading: boolean;

  constructor(private teamService: TeamService, private notService: NotificationsService, public dialog: MdDialog) {
  }

  joinTeam() {
    var team = new Team(this.model.teamName, this.model.password);
    this.loading = true;
    this.teamService.joinTeam(team.teamName, team.password)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            this.loading = false;
            if (data.ok) {
              this.notService.success('Team joined!', '');
              this.dialog.closeAll();
            } else {
              this.notService.error('Team join failed', data.errorMsg);
            }
          }
        },
        error => {
          this.loading = false;
          this.notService.error('Team join error', error);
        });
  }

}
