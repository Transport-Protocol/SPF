import {Component, OnInit} from '@angular/core';
import {TeamService} from '../_services/index';
import {Team} from "../_models/team";
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {InformNewTeamService} from "../_services/inform-new-team.service";
import {Response} from "@angular/http";

@Component({
  selector: 'app-change-team',
  templateUrl: './change-team.component.html',
  styleUrls: ['./change-team.component.scss']
})
export class ChangeTeamComponent implements OnInit {
  teams: Team[] = [];
  loading: boolean;

  constructor(private informNewTeamService: InformNewTeamService, private teamService: TeamService, private notService: NotificationsService) {
    this.listTeams();
  }

  ngOnInit() {
  }

  newTeam() {
    this.informNewTeamService.newTeam(true);
  }

  setTeams(teams: Team[]) {
    this.teams = teams;
  }

  changeTeam(team: Team) {
    localStorage.setItem('currentTeam', JSON.stringify(team));
    this.informNewTeamService.newTeam(true);
  }

  getTeamByName(teamName: string) {
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams[i].teamName === teamName) {
        return this.teams[i];
      }
    }
  }

  listTeams() {
    this.loading = true;
    this.teamService.listTeams()
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            this.loading = false;
            if (data.ok) {
              this.notService.success('Team list received!', '');
              this.setTeams(data.teamList);
            } else {
              this.notService.error('Team list failed', data.errorMsg);
            }
          }
        },
        error => {
          this.loading = false;
          this.notService.error('Team list error', error);
        });
  }


}
