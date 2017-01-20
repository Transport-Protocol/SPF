import {Component, Input} from '@angular/core';

import {AbstractFileStorageService, ActiveTabService} from '../_services/index';
import {FileMetaData, Team, FsProvider} from '../_models/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {slideIn} from'../_animations/animations';

import * as FileSaver from "file-saver";
import {Response} from "@angular/http";

@Component({
  selector: 'abstractFileStorage',
  templateUrl: 'abstractFileStorage.component.html',
  animations: [
    slideIn
  ]
})

export class AbstractFileStorageComponent {
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
  private uploadProgress: number;

  private fsProviderModel: FsProvider[] = [];
  private activeFsProvider: FsProvider = {
    name: 'Dropbox',
    imgPath: 'assets/images/dropbox.png'
  };

  constructor(private abstractFileStorageService: AbstractFileStorageService,
              private notService: NotificationsService,
              private activeTabService: ActiveTabService) {
    this.fillFsProvider();
  }

  ngOnInit() {
    this.activeTabService.wentActive(this.tabId);
    this.getFileTree();
  }

  changeListener($event): void {
    this.readFile($event.target);
  }

  setActiveFsProvider(selected: FsProvider) {
    this.activeFsProvider = selected;
  }

  fillFsProvider() {
    this.fsProviderModel[0] = {
      name: 'Google',
      imgPath: 'assets/images/googleDrive.png'
    };
    this.fsProviderModel[1] = {
      name: 'Dropbox',
      imgPath: 'assets/images/dropbox.png'
    };
    this.fsProviderModel[2] = {
      name: 'Owncloud',
      imgPath: 'assets/images/owncloud.png'
    };
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
    var curTeam = this.getCurTeam();
    this.abstractFileStorageService.uploadFile(this.targetUploadFile, this.parsePath() + fileName, this.activeFsProvider.name, curTeam.teamName)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            this.isUploading = false;
            if (data.ok) {
              this.notService.success('Got upload data!', '');
              this.getFileTree();
            } else {
              this.notService.error('upload failed', data.errorMsg);
            }
          } else {
            this.uploadProgress = data.bytes / data.total * 100;
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

  getCurTeam() {
    var curTeam: Team = JSON.parse(localStorage.getItem('currentTeam'));
    return curTeam;
  }

  getFileTree() {
    this.loading = true;
    var curTeam = this.getCurTeam();
    if (curTeam) {
      this.abstractFileStorageService.getFileTree(this.parsePath(), curTeam.teamName)
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
  }

  createFolder(name: string) {
    var folder = {
      name: name,
      tag: 'folder',
      isDownloading: false,
      isTransfering: false,
      shareClicked: false,
      contentLength: 0,
      bytesDownloaded: 0,
      progressInPercent: 0
    };
    this.dirs.push(folder);
  }

  getFile(index: number) {
    var targetDir = this.dirs[index];
    targetDir.isDownloading = true;
    var curTeam = this.getCurTeam();
    this.abstractFileStorageService.getFile(this.parsePath() + '/' + targetDir.name, curTeam.teamName)
      .subscribe(
        data => {
          if (data instanceof Response) {
            targetDir.isDownloading = false;
            if (data) {
              this.notService.success('Got file data!', '');
              FileSaver.saveAs(data.blob(), targetDir.name);
            }
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
        path += dir + '/';
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
