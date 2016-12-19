/**
 * Created by PhilippMac on 17.12.16.
 */
import { Directive, ElementRef, Renderer} from "@angular/core";
@Directive({
  selector: "[MyFocus]"
})

export class ScrollIntoViewDirective {
  constructor(private _el: ElementRef, private renderer: Renderer) {
  }

  ngAfterViewInit(){
    this.renderer.invokeElementMethod(this._el.nativeElement, 'scrollIntoView');
  }

}
