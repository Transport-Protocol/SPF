/**
 * Created by PhilippMac on 17.12.16.
 */
import {Injectable,Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams,ResponseContentType} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {APP_CONFIG} from '../_models/app.config';

@Injectable()
export class AbstractFileStorageService {



  constructor(private http: Http,@Inject(APP_CONFIG) private config) {
  }

  uploadFile(file:File,path:string,serviceName:string,teamName:string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('filePath',path);
    params.set('teamName',teamName);
    params.set('serviceName',serviceName);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.put(this.config.apiEndpoint+ 'filestorage/file',file, options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  getFileTree(path: string, teamName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('filePath',path);
    params.set('teamName',teamName);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint+ 'filestorage/filetree', options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  getFile(path: string, teamName: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('filePath',path);
    params.set('teamName',teamName);
    let options = new RequestOptions({headers: headers, search: params,responseType: ResponseContentType.Blob});
    return this.http.get(this.config.apiEndpoint + 'filestorage/file', options)
      .map((response: Response) => {
        return response;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }


}
