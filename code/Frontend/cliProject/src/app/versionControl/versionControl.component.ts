/**
 * Created by PhilippMac on 12.12.16.
 */
import {Component, Input} from '@angular/core';
import {FileMetaData} from '../_models/index';
import {ActiveTabService, VersionControlService} from '../_services/index';
import {NotificationsService} from 'angular2-notifications/lib/notifications.service';
import {slideIn} from'../_animations/animations';
import {Team} from "../_models/team";
import {User} from "../_models/user";
import {Response} from "@angular/http";


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
  selectedRepo: string;
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

  getRepositories() {
    this.repoListLoading = true;
    this.versionControlService.getRepositories(this.name)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            this.repoListLoading = false;
            if (data.ok) {
              this.notService.success('Got versioncontrol data!', '');
              this.repos = data.repos;
            } else {
              this.notService.error('Got versioncontrol failed', data.errorMsg);
            }
          }
        },
        error => {
          this.repoListLoading = false;
          this.notService.error('Got versioncontrol  error', error);
        });
  }

  getRepoContent() {
    this.loading = true;
    this.versionControlService.getRepositoryContent(this.parsePath(), this.selectedRepo, this.name)
      .subscribe(
        data => {
          if (data instanceof Response) {
            data = data.json();
            if (data.ok) {
              this.notService.success('Got repo content data!', '');
              this.fillDirs(data.dirs);
              this.sortByName();
              this.loading = false;
            } else {
              this.notService.error('repo content failed', data.errorMsg);
              this.loading = false;
            }
          }
        },
        error => {
          this.notService.error('repo content error', error);
          this.loading = false;
        });
  }

  repoClicked(repo: string, index: number) {
    this.curDir = ['root'];
    this.selectedRepo = repo;
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

  shareRepoWithTeam() {
    var myUser: User = JSON.parse(localStorage.getItem('currentUser'));
    var myTeam: Team;
    if (myTeam = JSON.parse(localStorage.getItem('currentTeam'))) {
      if (myTeam.members.length <= 1) {
        this.notService.error('no user except you in team', '');
      } else {
        for (let i = 0; i < myTeam.members.length; i++) {
          let memberName = myTeam.members[i];
          if (myUser.username !== memberName) {
            this.versionControlService.shareRepository(this.selectedRepo, this.name, memberName)
              .subscribe(
                data => {
                  if (data instanceof Response) {
                    data = data.json();
                    if (data.ok) {
                      this.notService.success('Shared repo with user: ' + memberName, '');
                    } else {
                      this.notService.error('Could not share repo with user: ' + memberName, data.errorMsg);
                    }
                  }
                },
                error => {
                  this.notService.error('Could not share repo with user: ' + memberName, error);
                });
          }
        }
      }
    } else {
      this.notService.error('no team selected for sharing repository', '');
    }
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
    if (this.curDir.length === 1) {
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
