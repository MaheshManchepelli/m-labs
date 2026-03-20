import { Component, OnInit, signal } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { ConnectionService } from './services/connection.service';
import { SearchService } from './services/search.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { fadeAnimation } from './services/route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {
  title = 'm-labs';
  connectionStatus: boolean = false;
  private isFirstConnectionCheck = true;
  

  constructor(private connectionService: ConnectionService, 
    private toastr: ToastrService, 
    private searchService: SearchService,
    private contexts: ChildrenOutletContexts
) { }

  ngOnInit(): void {
    this.connectionService.connectionStatus$.subscribe(isOnline => {
      this.connectionStatus = isOnline;
      if (!this.isFirstConnectionCheck || !isOnline) {
        if (isOnline) {
        this.toastr.success('You are back online!', 'Connection Status');
        } else {
          this.toastr.error('You are offline. Please check your internet connection.', 'Connection Status');
        } 
      }
      this.isFirstConnectionCheck = false;
    });
  }

    getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
