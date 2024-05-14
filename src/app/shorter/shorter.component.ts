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
import {$$, getParams, setParams, showError, showMessage} from "../../tools";
import {load_values, save_value} from "../linkut";
import {AboutComponent} from "../about/about.component";
import local = chrome.storage.local;
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";


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
    return new Promise(async (resolve)=> {

      this.api.get(environment.shorter_service + "/api/services/").subscribe({
        next: async (services: any) => {
          $$("Lecture des services depuis "+environment.shorter_service)
          this.chromeExt.set_local("services",JSON.stringify(services))
          this.services = services
          resolve(services)
        },
        error:async ()=>{
          $$("Erreur de lecture des services sur le serveur, usage du cache")
          let cache_service = await this.chromeExt.get_local("services","[]")
          this.services = JSON.parse(cache_service)
          resolve(this.services)
        }
      })
    })
  }

  ngOnDestroy() {
    this.save_values()
  }

  async ngOnInit() {
    await this.load_services()
    let params: any = await getParams(this.routes)
    try{this.url=await this.chromeExt.get_url()} catch (e) {}
    if(!this.url)this.url = params.url || await this.chromeExt.get_local("url") || "https://"
    this.message = params.message || "Ce lien n'est plus disponible"
    if (params.instant) setTimeout(() => {
      this.short()
    }, 500)

    if(this.services.length>0){
      let index = params.hasOwnProperty("service") ? Number(params.service) : Number(await this.chromeExt.get_local("last_index","0"))
      this.service_selected = index<this.services.length ? this.services[index] : this.services[0]
      this.changeOperation()
      this.short_url = ""
    }
  }


  async copy(toCopy:string,message="") {
    await navigator.clipboard.writeText(toCopy.replace("\n"," ").replace("\t"," "))
    showMessage(this,message)

  }


  async share() {
    await navigator.share({url: this.short_url})
  }

  save_values(){
    $$("Enregistrement des values")
    this.chromeExt.set_local("url",this.url)

    let i=0
    for(let s of this.services){
      if(s.service==this.service_selected.service)break;
      i++
    }
    this.chromeExt.set_local("last_index",i)
  }


  //_______________________________________________________________________________________________________________________
  async short()  {
    //Effectue la réduction
    if(this.url){
      if (!this.url.startsWith("http")) this.url = "https://" + this.url
      this.save_values()
    } else {
      showMessage(this,"L'url de destination doit être renseignée")
    }

    $$("Travail sur les parametres")
    let values = JSON.parse(await this.chromeExt.get_local("settings","{}"))
    for (let k in this.service_selected.params) {
      values[k]=values[k] || this.service_selected.params[k]
      if (values[k] == "?") {
        showMessage(this, "Le champs " + k + " doit être renseigné pour utiliser le service " + this.service_selected.service, 4000, () => {
        }, "Ok")
        return;
      }
    }

    if(this.service_selected.params.hasOwnProperty("network")){
      //Si le réseau est requis pour le service on l'intialise dans values
      values.network = values.network || "elrond-devnet"
    }

    if(values.hasOwnProperty("background")){
      if(values.background.startsWith("http")){
        values["style"]="background-image:url('"+values.background+"');background-size:cover;"
      }else{
        values["style"]="background-color:"+values.background
      }
      delete values.background
    }
    values["service"]=this.service_selected.id

    if(this.service_selected.params.hasOwnProperty("gate")){
      values["target"]=this.url
      values["bank"]={address:values["address"]}
      this.url=this.service_selected.params["gate"].replace("{{gate_server}}",environment.gate_server)+"?"+setParams(values)     //On ajoute le gate_server en intermédiaire
    }

    let body = {
      url: this.url,
      values: values
    }
    $$("objet pour raccourcir et filtrer url="+this.url,body)


    this.api.post(environment.shorter_service + "/api/add/", body, {responseType: "json"}).subscribe({
      next: (r: any) => {
        this.short_url = environment.transfer_page + "?" + r.cid
        this.qrcode=environment.server+"/api/qrcode/?code="+encodeURIComponent(this.short_url)
        this.code="<script>\n" +
          "if(!document.referrer.startsWith('"+environment.gate_server+"'))\nlocation.href='"+this.short_url+
        "'\n</script>"
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
    //this.chromeExt.set_local("url","")
    this.short_url = ""
  }


  async changeOperation()  {
    let values = await load_values("settings",this.chromeExt,{})
    for (let f in values) {
      if(typeof(f)=='object')f=f[0];
      if(this.service_selected && this.service_selected.description){
        this.service_selected.description = this.service_selected.description.replace("{{" + f + "}}", values[f]).replace("{{url}}",this.url)
      }
    }
  }


  open_about() {
    this.router.navigate(["about"])
  }


}
