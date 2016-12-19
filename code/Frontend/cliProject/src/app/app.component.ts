import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isDarkTheme: boolean = false;


  /**
   * Notification options
   */
  public options = {
    position: ["top", "left"],
    timeOut: 2000,
    animate: "fromRight",
    clickToClose: true
  }
}
