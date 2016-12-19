"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by PhilippMac on 01.12.16.
 */
var core_1 = require('@angular/core');
var ChangeBgColorDirective = (function () {
    function ChangeBgColorDirective(el) {
        this._defaultColor = 'blue';
        this.el = el.nativeElement;
    }
    ChangeBgColorDirective.prototype.onMouseEnter = function () { this.highlight(this.highlightColor || this._defaultColor); };
    ChangeBgColorDirective.prototype.onMouseLeave = function () { this.highlight(null); };
    ChangeBgColorDirective.prototype.highlight = function (color) {
        this.el.style.backgroundColor = color;
    };
    __decorate([
        core_1.Input('myHighlight'), 
        __metadata('design:type', String)
    ], ChangeBgColorDirective.prototype, "highlightColor", void 0);
    ChangeBgColorDirective = __decorate([
        core_1.Directive({
            selector: '[myChangeBgColor]',
            host: {
                '(mouseenter)': 'onMouseEnter()',
                '(mouseleave)': 'onMouseLeave()'
            }
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], ChangeBgColorDirective);
    return ChangeBgColorDirective;
}());
exports.ChangeBgColorDirective = ChangeBgColorDirective;
//# sourceMappingURL=ChangeBgColor.directive.js.map