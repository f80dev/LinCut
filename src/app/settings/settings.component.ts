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
import {TokenSelectorComponent} from "../token-selector/token-selector.component";
import network = chrome.privacy.network;
import {environment} from "../../environments/environment";
import {load_values} from "../linkut";



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
    MatIcon, InputComponent, AuthentComponent, TokenSelectorComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  address=""
  token=""
  collection=""
  quantity=1
  network="elrond-devnet"
  option_connexion: Connexion=environment.connexion

  constructor(public chromeExt:ChromeExtensionService,public router:Router) {

  }

  save(){
    let settings_to_save=JSON.stringify(
      {
        address: this.address,
        collection: this.collection,
        quantity:this.quantity,
        token:this.token
      }
  )
    if(this.chromeExt){
      this.chromeExt.set_local("settings",settings_to_save)
    }else{
      localStorage.setItem("settings",settings_to_save)
    }
  }

  async ngOnInit() {
    let settings:any=await load_values(this.chromeExt)
    this.quantity=settings.quantity
    this.token=settings.token
    this.collection=settings.collection
    this.address=settings.address
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
    this.address=evt.address
  }


}
