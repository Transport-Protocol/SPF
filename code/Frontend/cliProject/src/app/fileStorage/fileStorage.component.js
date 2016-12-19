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
var index_1 = require('../_services/index');
var FileStorageComponent = (function () {
    function FileStorageComponent(alertService, fileStorageService) {
        this.alertService = alertService;
        this.fileStorageService = fileStorageService;
        this.name = "not set";
        this.dirs = [];
        //this.lastDir = JSON.parse(localStorage.getItem('lastDir' + name));
        this.dirs = this.fileStorageService.getDirectoryContent('lel', 'randomApiEndpoint TODO');
    }
    FileStorageComponent = __decorate([
        core_1.Component({
            selector: 'fileStorage',
            moduleId: module.id,
            templateUrl: 'fileStorage.component.html'
        }), 
        __metadata('design:paramtypes', [index_1.AlertService, index_1.FileStorageService])
    ], FileStorageComponent);
    return FileStorageComponent;
}());
exports.FileStorageComponent = FileStorageComponent;
//# sourceMappingURL=fileStorage.component.js.map