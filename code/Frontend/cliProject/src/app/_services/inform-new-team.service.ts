/**
 * Created by PhilippMac on 14.12.16.
 */
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class InformNewTeamService {
  // Observable string sources
  private newTeamSource = new Subject<boolean>();
  // Observable string streams
  newTeam$ = this.newTeamSource.asObservable();
  // Service message commands
  newTeam(hasTeam: boolean) {
    this.newTeamSource.next(hasTeam);
  }

}
