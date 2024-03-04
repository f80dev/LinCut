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
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {InputComponent} from "../input/input.component";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {getParams, showError, showMessage} from "../../tools";
import {load_values} from "../linkut";
import {AboutComponent} from "../about/about.component";


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

export class ShorterComponent implements OnInit {
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
    this.service_selected = this.services[0]
  }


  async ngOnInit() {
    this.load_services()

    let params: any = await getParams(this.routes)
    this.url = params.url || localStorage.getItem("url") || "https://"
    this.message = params.message || "Ce lien n'est plus disponible"
    if (params.instant) setTimeout(() => {
      this.short()
    }, 500)



    if (chrome && chrome.storage) {
      let res: any = await chrome.storage.local.get(["url"])
      this.url = res.url || ""
      if (this.url == "") this.url = await this.chromeExt.get_url("https://lemonde.fr");
    } else {
      this.url = this.routes.snapshot.queryParams["url"] || ""
    }

    this.short_url = ""

    this.api.get(environment.shorter_service + "/api/services/").subscribe({
      next: (services: any) => {
        if (environment.mobile) {
          localStorage.setItem("services", services)
        } else {
          chrome.storage.local.set({services: services})
        }
        this.services = services
        let index = params.service ? Number(params.service) : 0
        this.service_selected = services[index]
      }
    })
  }


  async copy(toCopy:string) {
    await navigator.clipboard.writeText(toCopy)
    this.toast.open("Lien copié")
  }


  async share() {
    await navigator.share({url: this.short_url})
  }


  async short()  {
    //Effectue la réduction
    if (!this.url.startsWith("http")) this.url = "https://" + this.url
    localStorage.setItem("url",this.url)

    let values = await load_values(this.chromeExt)
    for (let k in this.service_selected.data) {
      if (this.service_selected.data[k] == "?" && values[k] == "") {
        showMessage(this, "Le champs " + k + " doit être renseigné pour utiliser le service " + this.service_selected.service, 4000, () => {
        }, "Ok")
        return;
      }
    }

    values.network = values.network.value
    let body = {
      url: this.url,
      service: this.service_selected.id,
      values: values
    }
    this.api.post(environment.shorter_service + "/api/add/", body, {responseType: "json"}).subscribe({
      next: (r: any) => {
        this.short_url = environment.shorter_service + "/" + r.cid
        this.api.post(environment.server+"/api/qrcode/",{url:this.short_url}).subscribe({
          next:(r:any)=>{this.qrcode=r.qrcode},
          error:(err:any)=>{showError(this,err)}
        })
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
    this.short_url = ""
  }


  async changeOperation($event: any) {
    let values = await load_values(this.chromeExt)
    for (let f in values) {
      if(typeof(f)!='string')f=f[0];
      this.service_selected.desc = this.service_selected.desc.replace("{{" + f + "}}", values[f])
    }
  }

  open_about() {
    this.router.navigate([AboutComponent])
  }
}
