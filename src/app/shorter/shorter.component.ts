import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {InputComponent} from "../input/input.component";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {$$, getParams, showError, showMessage} from "../../tools";
import {load_values, save_value} from "../linkut";
import {AboutComponent} from "../about/about.component";
import local = chrome.storage.local;


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
    ReactiveFormsModule, NgForOf, InputComponent,
    MatExpansionPanel,MatExpansionPanelHeader,
  ],
  templateUrl: './shorter.component.html',
  styleUrl: './shorter.component.css'
})

export class ShorterComponent implements OnInit,OnDestroy {
  url = "";
  short_url: string = ""
  qrcode:string=""
  services: any[] = []
  service_selected: any
  values: any = {}
  protected readonly environment = environment;
  duration: number = 100
  limit: number = 10000;
  message = ""
  code=""


  constructor(
    public chromeExt: ChromeExtensionService,
    public toast: MatSnackBar,
    public routes: ActivatedRoute,
    public router: Router,
    public api: HttpClient) {
  }


  async load_services() {
    const service_redirect = {service: "redirection", data: {}}
    let cache_service: any[] = [service_redirect]
    if (chrome && chrome.storage) {
      let rep = await chrome.storage.local.get(["services"])
      if (rep) {
        cache_service = JSON.parse(rep[0])
      }
    } else {
      try {
        if (localStorage.getItem("services")) cache_service = JSON.parse(localStorage.getItem("services") || "[]")
      } catch (e) {

      }

    }

    this.services = cache_service
    this.service_selected = this.services[Number(await this.chromeExt.get_local("last_index","0"))]
  }

  ngOnDestroy() {
    debugger
    let i=0
    for(let s of this.services){
      if(s.service==this.service_selected.service)break;
      i++
    }

    this.chromeExt.set_local("last_index",i)
  }

  async ngOnInit() {
    this.load_services()

    let params: any = await getParams(this.routes)
    this.url = params.url || await this.chromeExt.get_local("url") || "https://"
    this.message = params.message || "Ce lien n'est plus disponible"
    if (params.instant) setTimeout(() => {
      this.short()
    }, 500)


    this.short_url = ""

    this.api.get(environment.shorter_service + "/api/services/").subscribe({
      next: async (services: any) => {
        if (environment.mobile) {
          localStorage.setItem("services", services)
        } else {
          chrome.storage.local.set({services: services})
        }
        this.services = services
        let index = params.service ? Number(params.service) : 0
        this.service_selected = this.services[Number(await this.chromeExt.get_local("last_index","0"))]
      }
    })
  }


  async copy(toCopy:string,message="") {
    await navigator.clipboard.writeText(toCopy)
    showMessage(this,message)

  }


  async share() {
    await navigator.share({url: this.short_url})
  }


  async short()  {
    //Effectue la réduction
    if(this.url){
      if (!this.url.startsWith("http")) this.url = "https://" + this.url
      this.chromeExt.set_local("url",this.url)
    }

    let values = JSON.parse(await this.chromeExt.get_local("settings","{}"))
    for (let k in this.service_selected.data) {
      values[k]=values[k] || this.service_selected.data[k]
      if (values[k] == "?") {
        showMessage(this, "Le champs " + k + " doit être renseigné pour utiliser le service " + this.service_selected.service, 4000, () => {
        }, "Ok")
        return;
      }
    }
    if(this.service_selected.data.hasOwnProperty("network")){
      //Si le réseau est requis pour le service on l'intialise dans values
      values.network = values.network || "elrond-devnet"
    }

    if(this.service_selected.data.hasOwnProperty("domain")){
      values.domain=this.service_selected.data.domain.replace("{{gate_server}}",environment.gate_server)
    }

    if(values.hasOwnProperty("background")){
      if(values.background.startsWith("http")){
        values["style"]="background-image:url('"+values.background+"');background-size:cover;"
      }else{
        values["style"]="background-color:"+values.background
      }
      delete values.background
    }

    $$("Propriété du raccourcis ",values)

    let body = {
      url: this.url,
      service: this.service_selected.id,
      values: values
    }

    this.api.post(environment.shorter_service + "/api/add/", body, {responseType: "json"}).subscribe({
      next: (r: any) => {
        this.short_url = environment.shorter_service + "/" + r.cid
        this.qrcode=environment.server+"/api/qrcode/?code="+encodeURIComponent(this.short_url)
        this.code="p={};\nfor (const [key, value] of new URLSearchParams(location.search).entries()) {\np[key] = value;}\n" +
          "        if(!p.code)location.url='"+this.short_url+"'"
      },
      error: (err) => {
        this.toast.open("Problème de traitement de l'url, veuillez recommencer")
      }
    })
  }

  open_settings() {
    this.router.navigate(["settings"])
  }


  clear() {
    this.url=""
    this.chromeExt.set_local("url","")
    this.short_url = ""
  }


  async changeOperation($event: any) {
    let values = await load_values("settings",this.chromeExt,{})
    for (let f in values) {
      if(typeof(f)!='string')f=f[0];
      this.service_selected.desc = this.service_selected.desc.replace("{{" + f + "}}", values[f]).replace("{{url}}",this.url)
    }
  }


  open_about() {
    this.router.navigate(["about"])
  }


}
