import {Component, OnInit} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router, RouterOutlet} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/env";

@Component({
  selector: 'app-shorter',
  standalone: true,
  imports: [
    RouterOutlet, FormsModule, MatInputModule,
    MatButton,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgIf,
    ReactiveFormsModule, NgForOf
  ],
  templateUrl: './shorter.component.html',
  styleUrl: './shorter.component.css'
})
export class ShorterComponent implements OnInit {
  url = "";
  short_url: string=""
  services:any[] = []
  service_selected=""

  constructor(public chromeExt:ChromeExtensionService,
              public toast:MatSnackBar,
              public routes:ActivatedRoute,
              public router:Router,
              public api:HttpClient) {

  }


  async load_services(){
    const service_redirect={service:"redirection",url:""}
    let cache_service:any[]=[service_redirect]
    if(chrome && chrome.storage){
      let rep=await chrome.storage.local.get(["services"])
      if(rep){
        cache_service=JSON.parse(rep[0])
      }
    } else {
      cache_service=JSON.parse(localStorage.getItem("services") || "{}")
    }

    this.services=cache_service
    this.service_selected=this.services[0].url
  }


  async ngOnInit() {
    this.load_services()
    if(chrome && chrome.storage){
      let res:any=await chrome.storage.local.get(["url"])
      this.url=res.url || ""
      if(this.url=="")this.url = await this.chromeExt.get_url("https://lemonde.fr");
    }else{
      this.url=this.routes.snapshot.queryParams["url"] || ""
    }

    this.short_url=""

    this.api.get(environment.domain+"/api/services/").subscribe({
      next:(services:any)=>{
        if(environment.mobile){
          localStorage.setItem("services",services)
        }else{
          chrome.storage.local.set({services:services})
        }
        this.services=services
        this.service_selected=services[0].url
      }
    })
  }


  async copy() {
    await navigator.clipboard.writeText(this.short_url)
    this.toast.open("Lien copié")
  }


  async share() {
    await navigator.share({url:this.short_url})
  }


  short() {
    if(!this.url.startsWith("http"))this.url="https://"+this.url
    let headers:HttpHeaders=new HttpHeaders({
      "Content-Type":"application/json"
    })
    this.api.post(environment.domain+"/api/add/",{url:this.url},{responseType:"json"}).subscribe({
      next:(r:any)=>{
        this.short_url=environment.domain+"/"+r.cid
      },
      error:(err)=>{
        this.toast.open("Problème de traitement de l'url, veuillez recommencer")
      }
    })
  }

  open_settings() {
    this.router.navigate(["settings"])
  }


  clear() {
    this.short_url=""
    this.url=""
  }

  protected readonly environment = environment;
}
