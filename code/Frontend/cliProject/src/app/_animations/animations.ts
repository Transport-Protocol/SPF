/**
 * Created by PhilippMac on 09.12.16.
 */
import { trigger, state, style, transition, animate } from '@angular/core';

export const slideIn =   trigger('slideIn', [
  state('in', style({transform: 'translateX(0)'})),
  transition('void => *', [
    style({transform: 'translateX(-100%)'}),
    animate('400ms ease-in')
  ])
]);
