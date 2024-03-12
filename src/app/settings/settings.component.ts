import {Component,  OnInit} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatIcon} from "@angular/material/icon";
import {Router, RouterModule} from "@angular/router";
import {InputComponent} from "../input/input.component";
import {AuthentComponent} from "../authent/authent.component";
import {Connexion} from "../../operation";
import {TokenSelectorComponent} from "../token-selector/token-selector.component";
import {environment} from "../../environments/environment";
import {load_values} from "../linkut";
import {CollectionSelectorComponent} from "../collection-selector/collection-selector.component";
import {MatButton} from "@angular/material/button";
import {NetworkService} from "../network.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";



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
    MatIcon, InputComponent, AuthentComponent, TokenSelectorComponent, CollectionSelectorComponent, MatButton, MatTabGroup, MatTab
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  address=""
  token=""
  collection=""
  quantity=1
  option_connexion: Connexion=environment.connexion
  networks: any[]=[
    {value:"elrond-devnet",label:"DevNet multiversX"},
    {value:"elrond-mainnet",label:"MainNet multiversX"},
  ]
  network:any;
  unity="";

  constructor(public chromeExt:ChromeExtensionService,
              public api:NetworkService,
              public router:Router) {
    setTimeout(()=>{this.network=this.networks[0]},100)
  }

  save(){
    if(this.token!=""){
      this.api.get_token(this.token,this.network.value).subscribe((r:any)=>{
        if(r){
          this.unity=r.unity
          this.save()
        }else{
          this.unity="";
        }

      })
    }

    let settings_to_save=JSON.stringify(
      {
        address: this.address,
        collection: this.collection,
        quantity:this.quantity,
        token:this.token,
        network:this.network.value,
        unity:this.unity
      }
  )
    if(this.chromeExt){
      this.chromeExt.set_local("settings",settings_to_save)
    }else{
      localStorage.setItem("settings",settings_to_save)
    }
  }

  async ngOnInit() {
    let settings:any=await load_values("settings",this.chromeExt,{})
    this.quantity=settings.quantity
    this.token=settings.token
    this.collection=settings.collection
    this.address=settings.address
    this.network={value:settings.network,label:settings.network}
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


  raz(){
    this.address=""
    this.collection=""
    this.token=""
  }

  change_network(new_network:any) {
    this.raz()
    this.network=new_network
  }

  open_explorer($event: any,section="tokens") {
    let url="https://explorer.multiversx.com/"+section+"/"+$event
    if(this.network.value=="elrond-devnet")url=url.replace("explorer","devnet-explorer")
    open(url,"explorer")
  }

  open_spotlight(collection="") {
    let url="https://xspotlight.com/collections"
    if(collection.length>0)url=url+"/"+collection
    if(this.network.value=="elrond-devnet")url=url.replace("xspotlight","devnet.xspotlight")
    open(url,"spotlight")
  }
}
