///<reference types="chrome"/>
//voir https://stackoverflow.com/questions/53169721/how-to-use-chrome-extension-api-with-angular

import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService implements OnInit,OnDestroy {


  constructor() {
  }


  get_url(simulation = ""): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let tabs = await chrome.tabs.query({active: true, currentWindow: true})
        if (tabs.length > 0 && tabs[0] && tabs[0].url) {
          resolve(tabs[0].url)
        } else {
          reject()
        }
      } catch (e) {
        if (simulation.length > 0) {
          resolve(simulation)
        } else {
          reject()
        }

      }
    })
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }


  get_local(key: string) {
    return new Promise<any>((resolve) => {
      if(chrome.storage) {
        chrome.storage.local.get(key, (item: any) => {
          resolve(item)
        })
      }else{
        resolve(localStorage.getItem(key))
      }
    })
  }


  set_local(key:string,value:string){
    if(chrome.storage){
      chrome.storage.local.set({ key: value }, ()=>{
        //  Data's been saved boys and girls, go on home
      });
    }else{
      localStorage.setItem(key,value)
    }

  }
}
