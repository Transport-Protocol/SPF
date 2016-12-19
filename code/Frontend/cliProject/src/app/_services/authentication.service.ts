import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {User} from '../_models/index';
import {APP_CONFIG} from '../_models/app.config';

@Injectable()
export class AuthenticationService {
  constructor(private http: Http, @Inject(APP_CONFIG) private config) {
  }

  login(username: string, password: string) {
    let headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(username + ":" + password));
    let options = new RequestOptions({headers: headers});

    return this.http.post(this.config.apiEndpoint + 'user/login', {}, options)
      .map((response: Response) => {
        // login successful if status ok
        let data = response.json();
        if (data.ok) {
          // store user details in local storage to keep user logged in between page refreshes
          var user = new User(username, btoa(username + ':' + password));
          console.log('name of new user: ' + user.username);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return data;
      })
      .catch(this.handleError);
  }

  authList() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});

    return this.http.get(this.config.apiEndpoint + 'user/auth/list', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  oauth2Link(serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.config.apiEndpoint + 'auth/' + serviceName + '/authUrl', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  setBasicAuthOfService(serviceName: string, usernameOfService: string, passwordOfService: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('service', serviceName);
    params.set('token', "Basic " + btoa(usernameOfService + ":" + passwordOfService));
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.config.apiEndpoint + 'basicauth',{}, options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    //remove team
    localStorage.removeItem('currentTeam');
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }
}
