import {Component,  OnInit} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatIcon} from "@angular/material/icon";
import {Router, RouterModule} from "@angular/router";
import local = chrome.storage.local;
import set = chrome.cookies.set;
import {InputComponent} from "../input/input.component";
import {AuthentComponent} from "../authent/authent.component";
import {Connexion} from "../../operation";



@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatFormField, RouterModule,
    MatInput,
    MatLabel,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    MatIcon, InputComponent, AuthentComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  settings= {address: "", token:"", collection:"", quantity:1}
  option_connexion: Connexion={
    address: true,
    direct_connect: false,
    email: false,
    extension_wallet: false,
    google: false,
    keystore: false,
    nfluent_wallet_connect: false,
    on_device: false,
    private_key: false,
    wallet_connect: true,
    web_wallet: false,
    webcam: false
  }

  constructor(public chromeExt:ChromeExtensionService,public router:Router) {

  }

  save(){
    let settings_to_save=JSON.stringify(this.settings)
    if(this.chromeExt){
      this.chromeExt.set_local("settings",settings_to_save)
    }else{
      localStorage.setItem("settings",settings_to_save)
    }
  }

  async ngOnInit() {
    let obj=JSON.stringify({address: "", token:"", collection:"", quantity:1})
    if(this.chromeExt){
      obj=(await this.chromeExt.get_local("settings")) || obj
    }else{
      obj=localStorage.getItem("settings") || obj
    }

    this.settings=JSON.parse(obj)
  }


  go_back() {
    this.save()
    this.router.navigate(["shorter"])
  }

  authent(evt: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    this.settings.address=evt.address
  }
}
