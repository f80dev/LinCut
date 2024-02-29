export function load_values(chromeExt:any) : Promise<any> {
  return new Promise<any>( async(resolve,reject) => {
    let obj = ""

    if (chromeExt) {
      obj = (await chromeExt.get_local("settings")) || obj
    } else {
      obj = localStorage.getItem("settings") || obj
    }

    if (obj.length > 0) {
      resolve(JSON.parse(obj))
    } else {
      reject()
    }
  })
}
