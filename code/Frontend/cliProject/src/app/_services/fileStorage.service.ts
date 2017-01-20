import {Injectable, Inject, Component} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams, ResponseContentType} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {APP_CONFIG} from '../_models/app.config';

@Injectable()
export class FileStorageService {


  constructor(private http: Http, @Inject(APP_CONFIG) private config) {
  }

  uploadFile(file: File, path: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path', path);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.put(this.config.apiEndpoint + serviceName.toLowerCase() + '/file', file, options)
      .map((response: any) => {
        return response;
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
        return response;
      })
      .catch(this.handleError);
  }

  getFileTree(dir: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path', dir);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint + serviceName.toLowerCase() + '/filetree', options)
      .map((response: any) => {
        return response;
      })
      .catch(this.handleError);
  }

  getFile(path: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path', path);
    let options = new RequestOptions({headers: headers, search: params, responseType: ResponseContentType.Blob});
    return this.http.get(this.config.apiEndpoint + serviceName.toLowerCase() + '/file', options)
      .map((response: any) => {
        return response;
      })
      .catch(this.handleError);
  }

  transferFile(path: string, sourceService: string, targetService: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path', path);
    params.set('targetService', targetService);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.config.apiEndpoint + sourceService.toLowerCase() + '/file/transfer', {}, options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }


}
