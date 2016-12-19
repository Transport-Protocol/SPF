/**
 * Created by PhilippMac on 08.12.16.
 */
export class Team {
  teamName: string;
  password: string;
  teamCreator: string;
  members: string [] = [];
  services: string [] = [];

  constructor(teamName: string,password: string) {
    this.teamName = teamName;
    this.password = password;
  }
}
