/**
 * Created by PhilippMac on 12.12.16.
 */
import {Component, Input} from '@angular/core';
import {FileMetaData} from '../_models/index';
import {ActiveTabService, VersionControlService} from '../_services/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {slideIn} from'../_animations/animations';


@Component({
  selector: 'versionControl',
  templateUrl: 'versionControl.component.html',
  animations: [
    slideIn
  ]
})

export class VersionControlComponent {
  @Input() tabId: number;
  @Input() name: string;

  repos: string[] = [];
  chosenOption: string;
  private dirs: FileMetaData[] = [];
  private curDir: string[] = ['root'];
  private sortAscending: boolean = true;
  private currentSortType: SortTypes = SortTypes.NAME;
  private loading: boolean;
  private repoListLoading: boolean;

  constructor(private notService: NotificationsService,
              private activeTabService: ActiveTabService,
              private  versionControlService: VersionControlService) {
    //this.lastDir = JSON.parse(localStorage.getItem('lastDir' + name));
  }

  ngOnInit() {
    this.activeTabService.wentActive(this.tabId);
    this.getRepositories();
  }

  getRepositories(){
    this.repoListLoading = true;
    this.versionControlService.getRepositories(this.name)
      .subscribe(
        data => {
          this.repoListLoading = false;
          if (data.ok) {
            this.notService.success('Got versioncontrol data!', '');
            this.repos = data.repos;
          } else {
            this.notService.error('Got versioncontrol failed', data.errorMsg);
          }
        },
        error => {
          this.repoListLoading = false;
          this.notService.error('Got versioncontrol  error', error);
        });
  }

  getRepoContent() {
    this.loading = true;
    this.versionControlService.getRepositoryContent(this.parsePath(),this.chosenOption, this.name)
      .subscribe(
        data => {
          if (data.ok) {
            this.notService.success('Got repo content data!', '');
            this.fillDirs(data.dirs);
            this.sortByName();
            this.loading = false;
          } else {
            this.notService.error('repo content failed', data.errorMsg);
            this.loading = false;
          }
        },
        error => {
          this.notService.error('repo content error', error);
          this.loading = false;
        });
  }

  repoClicked(repo: string,index: number){
    this.curDir = ['root'];
    this.chosenOption = repo;
    this.getRepoContent();
  }

  handlePathButtonClick(e: MouseEvent, i: any) {
    this.curDir = this.curDir.slice(0, i + 1);
    this.getRepoContent();
  }

  rowClicked(index: any) {
    let selectedEntry = this.dirs[index];
    if (selectedEntry.tag === 'folder') {
      this.addPath(selectedEntry.name);
      this.getRepoContent();
    }
  }

  fillDirs(remoteDirs: FileMetaData[]) {
    this.dirs = remoteDirs;
  }

  addPath(path: string) {
    this.curDir.push(path);
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
    if(this.curDir.length === 1){
      path += '/';
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


}

enum SortTypes {
  NAME, TYPE
}
