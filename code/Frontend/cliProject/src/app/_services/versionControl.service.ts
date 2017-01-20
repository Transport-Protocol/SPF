/**
 * Created by PhilippMac on 12.12.16.
 */
import {Injectable,Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {APP_CONFIG} from '../_models/app.config';

@Injectable()
export class VersionControlService {



  constructor(private http: Http,@Inject(APP_CONFIG) private config) {
  }

  getRepositories(serviceName:string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.config.apiEndpoint+ serviceName.toLowerCase() + '/repositories', options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  getRepositoryContent(dir: string,repoName: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path',dir);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint+ serviceName.toLowerCase() + '/' + repoName + '/filetree', options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  shareRepository(repoName: string, serviceName: string,userToShareWith: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('usernameToAdd',userToShareWith);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.config.apiEndpoint+ serviceName.toLowerCase() + '/' + repoName + '/share',{}, options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }


}
