import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterModule, RouterOutlet} from '@angular/router';
import {environment} from "../environments/env";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'LinCut';
  height: string ="450px";
  width: string="350px";


  ngOnInit(): void {
    this.height=environment.height
    this.width=environment.width
  }
}
