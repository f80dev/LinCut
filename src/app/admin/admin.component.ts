import {Component, OnInit} from '@angular/core';
import {DbtableComponent} from "../dbtable/dbtable.component";
import {NetworkService} from "../network.service";
import {environment} from "../../environments/environment";
import {MatExpansionPanel} from "@angular/material/expansion";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    DbtableComponent,
    MatExpansionPanel
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  services:any[]=[]
  links: any[]=[]

  constructor(public api:NetworkService) {

  }

  ngOnInit(): void {
    this.api._get(environment.shorter_service+"/api/services/").subscribe({
      next:(r:any)=>{
        this.services=r
      }
    })
    this.api._get(environment.shorter_service+"/api/links/").subscribe({
      next:(r:any)=>{
        this.links=r
      }
    })

  }


  open_cel(evt: any) {
    if(evt.col=="url"){
      open(evt.value,"preview")
    }
  }
}
