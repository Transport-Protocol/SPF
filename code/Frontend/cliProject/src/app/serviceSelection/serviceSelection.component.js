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
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var index_1 = require('../_services/index');
var ServiceSelectionComponent = (function () {
    function ServiceSelectionComponent(router, alertService) {
        this.router = router;
        this.alertService = alertService;
        this.services = [];
        this.fillServices();
    }
    ServiceSelectionComponent.prototype.fillServices = function () {
        this.services[0] = {
            name: 'Dropbox',
            imgPath: 'images/dropbox.png'
        };
        this.services[1] = {
            name: 'Owncloud',
            imgPath: 'images/owncloud.png'
        };
        this.services[2] = {
            name: 'Google Drive',
            imgPath: 'images/googleDrive.png'
        };
        this.services[3] = {
            name: 'Bitbucket',
            imgPath: 'images/bitbucket.png'
        };
        this.services[4] = {
            name: 'Github',
            imgPath: 'images/dropbox.png'
        };
        this.services[5] = {
            name: 'Slack',
            imgPath: 'images/slack.png'
        };
    };
    ServiceSelectionComponent = __decorate([
        core_1.Component({
            selector: 'serviceSelection',
            moduleId: module.id,
            templateUrl: 'serviceSelection.component.html'
        }), 
        __metadata('design:paramtypes', [router_1.Router, index_1.AlertService])
    ], ServiceSelectionComponent);
    return ServiceSelectionComponent;
}());
exports.ServiceSelectionComponent = ServiceSelectionComponent;
//# sourceMappingURL=serviceSelection.component.js.map