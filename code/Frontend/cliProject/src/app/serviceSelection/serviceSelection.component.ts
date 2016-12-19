import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';

import {Service} from '../_models/service';
import {ActiveTabService} from '../_services/index';

@Component({
  selector: 'serviceSelection',
  templateUrl: 'serviceSelection.component.html',
  styleUrls: ['serviceSelection.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ActiveTabService]
})

export class ServiceSelectionComponent {
  private current: number = 0;
  private tabStarted: boolean[]= [false,false,false,false,false,false];

  constructor(private router: Router, private activeTabService: ActiveTabService) {
    activeTabService.wentActive$.subscribe(
      tabId => {
        this.tabStarted[tabId] = true;
      });
  }

}
