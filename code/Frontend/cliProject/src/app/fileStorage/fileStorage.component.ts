import {Component, Input} from '@angular/core';

import {FileStorageService, ActiveTabService} from '../_services/index';
import {FileMetaData, ShareService} from '../_models/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {slideIn} from'../_animations/animations';
import {XhrProgress} from '../_models/index';

import * as FileSaver from "file-saver";
import {Response} from "@angular/http";

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
  @Input() shares: ShareService[];

  private dirs: FileMetaData[] = [];
  private curDir: string[] = ['root'];
  private sortAscending: boolean = true;
  private currentSortType: SortTypes = SortTypes.NAME;
  private loading: boolean = false;
  private targetUploadFile: File;
  private uploadReady: boolean;
  private isUploading: boolean;
  private uploadProgress: number;

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
    this.fileStorageService.uploadFile(this.targetUploadFile, this.parsePath() + fileName, this.name)
      .subscribe(
        data => {
          if (data instanceof XhrProgress) {
            this.uploadProgress = data.bytes / data.total * 100;
          } else {
            this.isUploading = false;
            data = data.json();
            if (data.ok) {
              this.notService.success('Got upload data!', '');
            } else {
              this.notService.error('upload failed', data.errorMsg);
            }
            this.getFileTree();
          }
        },
        error => {
          this.isUploading = false;
          this.notService.error('upload error', error);
        });
  }

  addUploadedFile(file: FileMetaData) {
    let alreadyPresent = false;
    for (let i = 0; i < this.dirs.length; i++) {
      if (this.dirs[i].name === file.name) {
        alreadyPresent = true;
      }
    }
    if (!alreadyPresent) {
      this.dirs.push(file);
    }
  }

  getFileTree() {
    this.loading = true;
    this.fileStorageService.getFileTree(this.parsePath(), this.name)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            if (data.ok) {
              this.notService.success('Got filetree data!', '');
              this.fillDirs(data.dirs);
              this.sortByName();
              this.loading = false;
            } else {
              this.notService.error('filetree failed', data.errorMsg);
              this.loading = false;
            }
          }
        },
        error => {
          let errorMsg = error;
          if (error === '0 -  {"isTrusted":true}') {
            errorMsg = 'api offline!';
          }
          this.notService.error('filetree error', errorMsg);
          this.loading = false;
        });
  }

  getFile(index: number) {
    let targetDir = this.dirs[index];
    targetDir.isDownloading = true;
    let fileName = targetDir.name;
    this.fileStorageService.getFile(this.parsePath() + '/' + targetDir.name, this.name)
      .subscribe(
        data => {
          if (data instanceof XhrProgress) {
            this.dirs[index].progressInPercent = data.bytes / this.dirs[index].contentLength * 100;
          } else if (data instanceof Response) {
            data = data.blob();
            targetDir.isDownloading = false;
            this.dirs[index].progressInPercent = 0;
            this.notService.success('Got file data!', '');
            FileSaver.saveAs(data, fileName);
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
    remoteDirs.forEach(function (dir) {
      if (!dir.contentLength) {
        dir.contentLength = 0;
      }
    });
    this.dirs = remoteDirs;
  }

  parsePath() {
    let path: string = '';
    for (let i = 0; i < this.curDir.length; i++) {
      let dir = this.curDir[i];
      if (dir !== 'root') {
        path += dir + '/';
      }
    }
    return path;
  }

  sortByName() {
    if (this.currentSortType === SortTypes.TYPE || this.currentSortType === SortTypes.SIZE) {
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
    if (this.currentSortType === SortTypes.NAME || this.currentSortType === SortTypes.SIZE) {
      this.sortAscending = true;
    }
    this.currentSortType = SortTypes.TYPE;
    var sortedArray: FileMetaData[] = this.dirs.sort((n1, n2) => {
      let res = 0;
      if (n1.tag > n2.tag) {
        res = 1;
      } else if (n1.tag < n2.tag) {
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

  sortBySize() {
    if (this.currentSortType === SortTypes.NAME || this.currentSortType === SortTypes.TYPE) {
      this.sortAscending = true;
    }
    this.currentSortType = SortTypes.SIZE;
    var sortedArray: FileMetaData[] = this.dirs.sort((n1, n2) => {
      let res = 0;
      if (n1.contentLength > n2.contentLength) {
        res = 1;
      } else if (n1.contentLength < n2.contentLength) {
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

  shareClicked(index: any) {
    this.dirs[index].shareClicked = true;
  }

  shareServiceClicked(dirIndex: number, shareServiceIndex: number) {
    let targetDir = this.dirs[dirIndex];
    let targetShareService = this.shares[shareServiceIndex];
    this.transferFile(targetDir, targetShareService);
  }

  transferFile(targetDir: FileMetaData, targetShareService: ShareService) {
    targetDir.isTransfering = true;
    this.fileStorageService.transferFile(this.parsePath() + '/' + targetDir.name, this.name, targetShareService.name)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            targetDir.isTransfering = false;
            if (data.ok) {
              this.notService.success('file successfully transferred to ' + targetShareService.name, '');
            } else {
              this.notService.error('file transfer failed', data.errorMsg);
            }
          }
        },
        error => {
          targetDir.isTransfering = false;
          this.notService.error('file transfer error', error);
        });
  }

}

enum SortTypes {
  NAME, TYPE, SIZE
}
