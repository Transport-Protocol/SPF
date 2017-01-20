/**
 * Created by PhilippMac on 08.12.16.
 */
import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import {APP_CONFIG} from '../_models/app.config';
import {Team} from '../_models/index';

@Injectable()
export class TeamService {
  constructor(private http: Http, @Inject(APP_CONFIG) private config) {
  }

  createTeam(team: Team) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('password', team.password);
    let options = new RequestOptions({headers: headers, search: params});

    return this.http.post(this.config.apiEndpoint + team.teamName + '/create', {}, options)
      .map(res => res)
      .catch(this.handleError);
  }

  listTeams() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});

    return this.http.get(this.config.apiEndpoint + 'teams', options)
      .map(res => res)
      .catch(this.handleError);
  }

  joinTeam(teamName: string,password: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('password', password);
    let options = new RequestOptions({headers: headers, search: params});

    return this.http.post(this.config.apiEndpoint + teamName + '/join', {}, options)
      .map(res => res)
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }
}
