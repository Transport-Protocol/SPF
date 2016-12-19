/**
 * Created by PhilippMac on 15.12.16.
 */
import {Injectable,Inject} from '@angular/core';
import {Http, Headers, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {APP_CONFIG} from '../_models/app.config';
import {SlackChannel} from "../_models/slackChannel";

@Injectable()
export class SlackService {



  constructor(private http: Http,@Inject(APP_CONFIG) private config) {
  }

  channelList() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let options = new RequestOptions({headers: headers});
    console.log('channelList slackService');
    return this.http.get(this.config.apiEndpoint+ 'slack/channelList', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  channelMessages(channel: SlackChannel,oldest: any) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('channelId',channel.id);
    params.set('oldest',oldest);
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.config.apiEndpoint+'slack/channel/messages', options)
      .map((response: Response) => {
        // request successful if status ok
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  sendMessage(channelId: string, message: string) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let headers = new Headers();
    headers.append("Authorization", "Basic " + currentUser.basicAuth);
    let params = new URLSearchParams();
    params.set('channelId',channelId);
    params.set('message',message);
    params.set('as_user','true');
    let options = new RequestOptions({headers: headers, search: params});
    return this.http.post(this.config.apiEndpoint+'slack/sendMessage',{}, options)
      .map((response: Response) => {
        let data = response.json();
        return data;
      })
      .catch(this.handleError);
  }

  private handleError(error: Response | any) {
    return Observable.throw(error || 'Server error');
  }


}
