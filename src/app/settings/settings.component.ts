import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatIcon} from "@angular/material/icon";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatFormField,RouterModule,
    MatInput,
    MatLabel,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    MatIcon
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  settings= {address: "", token:"", collection:"", quantity:1}


  constructor(public chromeExt:ChromeExtensionService,public router:Router) {

  }

  async ngOnInit() {
    let obj=await this.chromeExt.get_local("settings")
    if(obj=="null")obj={address: "", token:"", collection:"", quantity:1}
    this.settings=JSON.parse(obj)
  }


  go_back() {
    this.chromeExt.set_local("settings",JSON.stringify(this.settings))
    this.router.navigate(["shorter"])
  }
}
