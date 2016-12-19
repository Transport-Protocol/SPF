/**
 * Created by PhilippMac on 01.12.16.
 */
import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[app-MyChangeBgColor]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()'
  }
})
export class ChangeBgColorDirective {
  @Input() highlightColor: string;
  private _defaultColor = 'blue';
  private el: HTMLElement;

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }


  onMouseEnter() {
    this.highlight(this.highlightColor || this._defaultColor);
  }

  onMouseLeave() {
    this.highlight(null);
  }

  private highlight(color: string) {
    this.el.style.backgroundColor = color;
  }
}
