import {Component, Input} from '@angular/core';

import {FileStorageService, ActiveTabService} from '../_services/index';
import {FileMetaData} from '../_models/fileMetaData';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {slideIn} from'../_animations/animations';

import * as FileSaver from "file-saver";

@Component({
  selector: 'fileStorage',
  templateUrl: 'fileStorage.component.html',
  animations: [
    slideIn
  ]
})

export class FileStorageComponent {
  @Input() tabId: number;
  @Input() name: string;

  private dirs: FileMetaData[] = [];
  private curDir: string[] = ['root'];
  private sortAscending: boolean = true;
  private currentSortType: SortTypes = SortTypes.NAME;
  private loading: boolean = false;
  private targetUploadFile: File;
  private uploadReady: boolean;
  private isUploading: boolean;

  constructor(private fileStorageService: FileStorageService,
              private notService: NotificationsService,
              private activeTabService: ActiveTabService) {
    //this.lastDir = JSON.parse(localStorage.getItem('lastDir' + name));
  }

  ngOnInit() {
    this.activeTabService.wentActive(this.tabId);
    this.getFileTree();
  }

  changeListener($event): void {
    this.readFile($event.target);
  }

  readFile(inputValue: any): void {
    var self = this;
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onloadend = function (e) {
      self.targetUploadFile = file;
      self.uploadReady = true;
    };
    myReader.readAsText(file);
  }

  uploadFile() {
    var fileName = this.targetUploadFile.name;
    this.isUploading = true;
    this.uploadReady = false;
    this.fileStorageService.uploadFile(this.targetUploadFile, this.parsePath(), this.name)
      .subscribe(
        data => {
          this.isUploading = false;
          if (data.ok) {
            this.notService.success('Got upload data!', '');
          } else {
            this.notService.error('upload failed', data.errorMsg);
          }
        },
        error => {
          this.isUploading = false;
          this.notService.error('upload error', error);
        });
  }

  getFileTree() {
    this.loading = true;
    this.fileStorageService.getFileTree(this.parsePath(), this.name)
      .subscribe(
        data => {
          if (data.ok) {
            this.notService.success('Got filetree data!', '');
            this.fillDirs(data.dirs);
            this.sortByName();
            this.loading = false;
          } else {
            this.notService.error('filetree failed', data.errorMsg);
            this.loading = false;
          }
        },
        error => {
          let errorMsg = error;
          if(error === '0 -  {"isTrusted":true}'){
            errorMsg = 'api offline!';
          }
          this.notService.error('filetree error', errorMsg);
          this.loading = false;
        });
  }

  getFile(index: number) {
    var targetDir = this.dirs[index];
    targetDir.isDownloading = true;
    this.fileStorageService.getFile(this.parsePath() + '/' + targetDir.name, this.name)
      .subscribe(
        data => {
          targetDir.isDownloading = false;
          if (data.ok) {
            this.notService.success('Got file data!', '');
            var uint8Array = new Uint8Array(data.fileBuffer.data);
            var blob = new Blob([uint8Array]);
            var filename = data.fileName;
            FileSaver.saveAs(blob, filename);
          } else {
            this.notService.error('getFile failed', data.errorMsg);
          }
        },
        error => {
          targetDir.isDownloading = false;
          this.notService.error('getFile error', error);
        });
  }

  fillDirs(remoteDirs: FileMetaData[]) {
    this.dirs = remoteDirs;
  }

  parsePath() {
    let path: string = '';
    for (let i = 0; i < this.curDir.length; i++) {
      let dir = this.curDir[i];
      if (dir !== 'root') {
        path += dir;
        if (i !== this.curDir.length - 1) {
          path += '/';
        }
      }
    }
    return path;
  }

  sortByName() {
    if (this.currentSortType === SortTypes.TYPE) {
      this.sortAscending = true;
    }
    this.currentSortType = SortTypes.NAME;
    var sortedArray: FileMetaData[] = this.dirs.sort((n1, n2) => {
      let res = n1.name.toLowerCase().localeCompare(n2.name.toLowerCase());
      if (!this.sortAscending) {
        res *= -1;
      }
      return res;
    });
    this.sortAscending = !this.sortAscending;
    this.dirs = sortedArray;
  }

  sortByType() {
    console.log('sortbytype clicked');
    if (this.currentSortType === SortTypes.NAME) {
      this.sortAscending = true;
    }
    this.currentSortType = SortTypes.TYPE;
    var sortedArray: FileMetaData[] = this.dirs.sort((n1, n2) => {
      let res = 0;
      if (n1.tag > n2.tag) {
        res = 1;
      }
      if (n1.tag < n2.tag) {
        res = -1;
      }
      if (!this.sortAscending) {
        res *= -1;
      }
      return res;
    });
    this.sortAscending = !this.sortAscending;
    this.dirs = sortedArray;
  }

  handlePathButtonClick(e: MouseEvent, i: any) {
    this.curDir = this.curDir.slice(0, i + 1);
    this.getFileTree();
  }

  addPath(path: string) {
    this.curDir.push(path);
  }

  rowClicked(index: any) {
    let selectedEntry = this.dirs[index];
    if (selectedEntry.tag === 'folder') {
      this.addPath(selectedEntry.name);
      this.getFileTree();
    }
  }

}

enum SortTypes {
  NAME, TYPE
}
