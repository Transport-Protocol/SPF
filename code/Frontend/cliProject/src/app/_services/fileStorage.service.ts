import {Injectable,Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {APP_CONFIG} from '../_models/app.config';

@Injectable()
export class FileStorageService {



  constructor(private http: Http,@Inject(APP_CONFIG) private config) {
  }

  uploadFile(file:File,path:string,serviceName:string) {
    let formData = new FormData();
    formData.append('file',file);
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path',path);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.put(this.config.apiEndpoint+ serviceName.toLowerCase() + '/upload',formData, options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  authList() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    console.log('password ' + currentUser.basicAuth);
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});

    return this.http.get(this.config.apiEndpoint+'user/auth/list', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  getFileTree(dir: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path',dir);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint+ serviceName.toLowerCase() + '/filetree', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  getFile(path: string, serviceName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('path',path);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint+ serviceName.toLowerCase() + '/file', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }


}
