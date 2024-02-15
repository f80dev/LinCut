import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatButton} from "@angular/material/button";
import {ChromeExtensionService} from "./chrome-extension.service";
import {HttpClient, HttpHeaders, HttpParamsOptions} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatFormField, MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButton, MatSelect, MatOption, MatFormField, FormsModule, MatInputModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'LinCut';
  url = "";
  domain="https://t.f80.fr/"
  short_url: string=""

  constructor(public chromeExt:ChromeExtensionService,
              public toast:MatSnackBar,
              public api:HttpClient) {

  }

  async ngOnInit() {
    try {
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
}
