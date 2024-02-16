import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChromeExtensionService} from "../chrome-extension.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router, RouterOutlet} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";

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
        ReactiveFormsModule
    ],
  templateUrl: './shorter.component.html',
  styleUrl: './shorter.component.css'
})
export class ShorterComponent {
  url = "";
  domain="https://t.f80.fr/"
  short_url: string=""

  constructor(public chromeExt:ChromeExtensionService,
              public toast:MatSnackBar,
              public router:Router,
              public api:HttpClient) {

  }

  async ngOnInit() {
    try {
      this.short_url=""
      this.url = await this.chromeExt.get_url("https://lemonde.fr");
    }catch (e) {
      this.url=""
    }
  }


  async copy() {
    await navigator.clipboard.writeText(this.url)
    this.toast.open("Lien copié")
  }

  async share() {
    await navigator.share({url:this.url})
  }

  short() {
    this.url="Lecture de l'adresse"
    let headers:HttpHeaders=new HttpHeaders({
      "Content-Type":"application/json"
    })
    this.api.post(this.domain+"api/add/",{url:this.url},{responseType:"text"}).subscribe({
      next:(r:string)=>{
        this.short_url=this.domain+r
      },
      error:(err)=>{
        this.toast.open("Problème de traitement de l'url")
      }
    })
  }

  open_settings() {
    this.router.navigate(["settings"])
  }

}