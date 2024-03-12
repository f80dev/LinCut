export function load_values(k:string,chromeExt:any,_default={}) : Promise<any> {
  return new Promise<any>( async(resolve,reject) => {
    let obj:any =null

    try{
      obj = (await chromeExt.get_local(k)) || JSON.stringify(_default)
    }catch (e) {
      obj = localStorage.getItem(k) || JSON.stringify(_default)
    }

    if (obj) {
      resolve(JSON.parse(obj))
    } else {
      reject()
    }
  })
}

export async function save_value(k:string,v:any,chromeExt:any=null){
  //voir https://developer.chrome.com/docs/extensions/reference/api/storage?hl=fr#property-local
  try{
    await chromeExt.set_local(k,v)
    return true
  }catch(e){
    localStorage.setItem(k,JSON.stringify(v))
    return true
  }
}
