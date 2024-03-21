///<reference types="chrome"/>
//voir https://stackoverflow.com/questions/53169721/how-to-use-chrome-extension-api-with-angular

import {Injectable, OnDestroy, OnInit} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChromeExtensionService {


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



  async get_local(key: string,_default="") : Promise<string> {
    return new Promise<any>((resolve) => {
      if(chrome && chrome.storage) {
        chrome.storage.local.get(key, (item: any) => {
          resolve(item[key] || _default)
        })
      }else{
        resolve(localStorage.getItem(key) || _default)
      }
    })
  }


  set_local(key:string,value:any){
    return new Promise<boolean>(async (resolve) => {
      if(chrome && chrome.storage){
        let obj=JSON.parse(await this.get_local(key,"{}"))
        obj[key]=value
        chrome.storage.local.set(obj, ()=>{
        resolve(true)
        });
      }else{
        localStorage.setItem(key,value)
        resolve(true)
      }
    })


  }
}
