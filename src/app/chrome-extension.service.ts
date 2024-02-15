///<reference types="chrome"/>
//voir https://stackoverflow.com/questions/53169721/how-to-use-chrome-extension-api-with-angular

import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService implements OnInit,OnDestroy {

  evt: Subject<string> = new Subject<string>();

  constructor() {
  }


  get_url(simulation="") : Promise<string>{
    return new Promise(async (resolve,reject) => {
      try{
        let tabs=await chrome.tabs.query({active: true, currentWindow: true})
        if(tabs.length>0 && tabs[0] && tabs[0].url){
          resolve(tabs[0].url)
        }else {
          reject()
        }
      } catch (e) {
        if(simulation.length>0){
          resolve(simulation)
        }else{
          reject()
        }

      }
    })
  }


  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', ()=> {
      this.evt.next("loaded")
    })

    // document.addEventListener('DOMContentLoaded', function() {
    //   setTimeout(()=>{
    //     chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    //       // Access the active tab and do something based on the button click
    //       let rep = await sendUrlToServer(tabs[0].url);
    //       document.getElementById("result").innerText=domain+rep
    //       document.getElementById("result_link").href=domain+rep
    //     });
    //   },100)
    // });
  }

  ngOnDestroy(): void {
  }


}
