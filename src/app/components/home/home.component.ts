import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { fadeAnimation } from '../../services/route-animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
    animations: [ fadeAnimation ]
})
export class HomeComponent implements OnInit {

  constructor() { }
  

  ngOnInit() {

  }
}
