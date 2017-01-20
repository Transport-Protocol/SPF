import {Component, OnInit} from '@angular/core';
import {TeamService} from '../_services/index';
import {Team} from "../_models/team";
import {MdDialog} from '@angular/material';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {Response} from "@angular/http";

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss']
})
export class CreateTeamComponent implements OnInit {
  model: any = {};
  loading: boolean;

  constructor(private teamService: TeamService, private notService: NotificationsService, public dialog: MdDialog) {
  }

  ngOnInit() {
  }

  createTeam() {
    var team = new Team(this.model.teamName, this.model.password);
    this.loading = true;
    this.teamService.createTeam(team)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            this.loading = false;
            if (data.ok) {
              this.notService.success('Team created!', '');
              this.dialog.closeAll();
            } else {
              this.notService.error('Team creation failed', data.errorMsg);
            }
          }
        },
        error => {
          this.loading = false;
          this.notService.error('Team creation error', error);
        });
  }

}
