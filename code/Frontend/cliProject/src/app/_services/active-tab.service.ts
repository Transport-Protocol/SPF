/**
 * Created by PhilippMac on 07.12.16.
 */
import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class ActiveTabService {
  // Observable string sources
  private wentActiveSource = new Subject<number>();
  // Observable string streams
  wentActive$ = this.wentActiveSource.asObservable();
  // Service message commands
  wentActive(tabId: number) {
    this.wentActiveSource.next(tabId);
  }

}
