import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { fromEvent, map, merge, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  public connectionStatus$ = new Observable<boolean>();
  private platformId = inject(PLATFORM_ID);
  
  constructor() {

    if (isPlatformBrowser(this.platformId)) {
      this.connectionStatus$ = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false)),
      );
    }
  }

}
