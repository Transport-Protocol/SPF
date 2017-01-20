import {Injectable, Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import {APP_CONFIG} from '../_models/app.config';
import {User} from '../_models/index';

@Injectable()
export class UserService {
  constructor(private http: Http, @Inject(APP_CONFIG) private config) {
  }

  create(user: User) {
    let headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(user.username + ":" + user.password));
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.config.apiEndpoint + 'user/register', {}, options)
      .map((response: any) => {
        return response;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }
}
